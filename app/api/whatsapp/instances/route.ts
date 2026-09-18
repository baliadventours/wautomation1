import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/src/lib/supabase/server';
import { evolutionApi } from '@/src/lib/evolution';
import { encrypt } from '@/src/lib/encryption';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const supabase = createServerClient(token);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: instances, error } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ instances });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const supabase = createServerClient(token);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Check subscription quotas (instance_limit)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('instance_limit, plan')
      .eq('user_id', user.id)
      .single();

    const instanceLimit = subscription?.instance_limit || 1;

    const { count: currentInstancesCount } = await supabase
      .from('whatsapp_instances')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((currentInstancesCount || 0) >= instanceLimit) {
      return NextResponse.json(
        {
          error: `Plan limit reached. Your ${subscription?.plan || 'starter'} plan allows ${instanceLimit} WhatsApp instance(s). Please upgrade your subscription.`,
        },
        { status: 403 }
      );
    }

    // 2. Generate tenant-scoped instance name & secret token
    const safeUserId = user.id.replace(/-/g, '').slice(0, 8);
    const instanceName = `tenant_${safeUserId}_${Date.now().toString(36)}`;
    const perInstanceToken = `wac_tok_${crypto.randomBytes(16).toString('hex')}`;
    const encryptedToken = encrypt(perInstanceToken);

    // Build the public webhook URL for this Next.js app
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://my-saas.vercel.app';
    const webhookUrl = `${appBaseUrl}/api/webhooks/evolution`;

    // 3. Call Evolution API to provision the Baileys instance
    const evolutionResult = await evolutionApi.createInstance(
      instanceName,
      webhookUrl,
      perInstanceToken
    );

    // 4. Save to Supabase with RLS user_id enforcement
    const { data: newInstance, error: dbError } = await supabase
      .from('whatsapp_instances')
      .insert({
        user_id: user.id,
        instance_name: instanceName,
        status: 'connecting',
        evolution_token: encryptedToken,
      })
      .select()
      .single();

    if (dbError) {
      // Cleanup Evolution instance if DB insert fails
      await evolutionApi.deleteInstance(instanceName).catch(() => {});
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      instance: newInstance,
      qrcode: evolutionResult?.qrcode || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
