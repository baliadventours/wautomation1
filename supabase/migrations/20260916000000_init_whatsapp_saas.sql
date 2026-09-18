-- ==============================================================================
-- Supabase / PostgreSQL Migration: Multi-Tenant WhatsApp SaaS on Evolution API
-- Migration: 20260916000000_init_whatsapp_saas.sql
-- ==============================================================================

-- Enable UUID extension and pgcrypto if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table (1-to-1 with auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. Subscriptions Table (Plan & Quotas Enforcement)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  instance_limit INT NOT NULL DEFAULT 1,
  message_limit INT NOT NULL DEFAULT 2500,
  messages_sent_this_period INT NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. WhatsApp Instances Table (Evolution API Mapping)
-- ------------------------------------------------------------------------------
-- Status Enum: connecting, connected, disconnected, banned
CREATE TABLE IF NOT EXISTS public.whatsapp_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL UNIQUE, -- e.g. tenant_<user_id>_<timestamp>
  status TEXT NOT NULL DEFAULT 'connecting' CHECK (status IN ('connecting', 'connected', 'disconnected', 'banned')),
  phone_number TEXT,
  profile_name TEXT,
  profile_picture_url TEXT,
  connected_at TIMESTAMPTZ,
  evolution_token TEXT, -- Encrypted token at rest for Evolution API instance token
  webhook_secret TEXT DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_user_id ON public.whatsapp_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_instance_name ON public.whatsapp_instances(instance_name);

-- ------------------------------------------------------------------------------
-- 4. Message Logs Table (History, Audit, & Debugging)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  to_number TEXT NOT NULL,
  from_number TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'received', 'failed')),
  evolution_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_logs_instance_id ON public.message_logs(instance_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_created_at ON public.message_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. Automations Table (Rule-Based WhatsApp Auto-Responders)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  instance_id UUID REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('keyword', 'webhook', 'schedule')),
  -- trigger_config examples:
  -- {"keyword": "pricing", "match_type": "contains"}
  -- {"keyword": "book", "match_type": "exact"}
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- action_config examples:
  -- {"action": "reply", "reply_text": "Hi! Thanks for contacting Bali Adventours. Here are our tours: https://..."}
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automations_user_id ON public.automations(user_id);
CREATE INDEX IF NOT EXISTS idx_automations_instance_id ON public.automations(instance_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all 5 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Subscriptions Policies
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 3. WhatsApp Instances Policies
CREATE POLICY "instances_select_own"
  ON public.whatsapp_instances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "instances_insert_own"
  ON public.whatsapp_instances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "instances_update_own"
  ON public.whatsapp_instances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "instances_delete_own"
  ON public.whatsapp_instances FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Message Logs Policies (Via join to instances owned by current user)
CREATE POLICY "message_logs_select_own"
  ON public.message_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.whatsapp_instances
      WHERE public.whatsapp_instances.id = message_logs.instance_id
      AND public.whatsapp_instances.user_id = auth.uid()
    )
  );

CREATE POLICY "message_logs_insert_own"
  ON public.message_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.whatsapp_instances
      WHERE public.whatsapp_instances.id = message_logs.instance_id
      AND public.whatsapp_instances.user_id = auth.uid()
    )
  );

-- 5. Automations Policies
CREATE POLICY "automations_all_own"
  ON public.automations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- AUTOMATIC USER PROVISIONING TRIGGER (auth.users -> profiles + subscriptions)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Create Profile
  INSERT INTO public.profiles (id, email, full_name, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'starter'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create Initial Default Starter Subscription
  INSERT INTO public.subscriptions (user_id, plan, status, instance_limit, message_limit)
  VALUES (
    NEW.id,
    'starter',
    'active',
    1,     -- 1 WhatsApp number for Starter plan
    2500   -- 2,500 messages per month
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Attach trigger to Supabase auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
