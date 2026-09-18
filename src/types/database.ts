export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type InstanceStatus = 'connecting' | 'connected' | 'disconnected' | 'banned';
export type MessageDirection = 'in' | 'out';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'received' | 'failed';
export type TriggerType = 'keyword' | 'webhook' | 'schedule';
export type SubscriptionPlan = 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: SubscriptionPlan;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  instance_limit: number;
  message_limit: number;
  messages_sent_this_period: number;
  period_start: string;
  period_end: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppInstance {
  id: string;
  user_id: string;
  instance_name: string;
  status: InstanceStatus;
  phone_number: string | null;
  profile_name: string | null;
  profile_picture_url: string | null;
  connected_at: string | null;
  evolution_token: string | null;
  webhook_secret: string;
  created_at: string;
  updated_at: string;
}

export interface MessageLog {
  id: string;
  instance_id: string;
  direction: MessageDirection;
  to_number: string;
  from_number: string;
  body: string;
  status: MessageStatus;
  evolution_message_id: string | null;
  error_message: string | null;
  created_at: string;
}

export interface Automation {
  id: string;
  user_id: string;
  instance_id: string | null;
  name: string;
  trigger_type: TriggerType;
  trigger_config: {
    keyword?: string;
    match_type?: 'exact' | 'contains' | 'regex' | 'starts_with';
    case_sensitive?: boolean;
    [key: string]: any;
  };
  action_config: {
    action?: 'reply' | 'forward' | 'webhook';
    reply_text?: string;
    media_url?: string;
    [key: string]: any;
  };
  enabled: boolean;
  created_at: string;
  updated_at: string;
}
