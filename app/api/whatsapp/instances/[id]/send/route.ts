import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase/server';
import { evolutionApi } from '@/src/lib/evolution';
import { decrypt } from '@/src/lib/encryption';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const supabase = createServerClient(token);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const instanceId = params.id;
    const body = await req.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing required fields: "to" and "message"' }, { status: 400 });
    }

    // 1. Verify tenant owns this instance
    const { data: instance, error: instError } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .eq('id', instanceId)
      .eq('user_id', user.id)
      .single();

    if (instError || !instance) {
      return NextResponse.json({ error: 'Instance not found or access denied' }, { status: 404 });
    }

    if (instance.status !== 'connected') {
      return NextResponse.json(
        { error: 'WhatsApp instance is not connected. Please scan the QR code first.' },
        { status: 400 }
      );
    }

    // 2. Check tenant monthly message quota against subscriptions
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subscription) {
      const used = subscription.messages_sent_this_period || 0;
      const limit = subscription.message_limit || 2500;
      if (used >= limit) {
        return NextResponse.json(
          { error: `Monthly message quota exceeded (${used}/${limit}). Please upgrade your plan.` },
          { status: 429 }
        );
      }
    }

    // 3. Decrypt the per-instance token
    const perInstanceToken = instance.evolution_token ? decrypt(instance.evolution_token) : undefined;

    // 4. Send the message via Evolution API
    const result = await evolutionApi.sendTextMessage(
      instance.instance_name,
      to,
      message,
      perInstanceToken
    );

    // 5. Log outgoing message in message_logs table
    const cleanTo = evolutionApi.cleanNumber(to);
    const fromNum = instance.phone_number || instance.instance_name;

    await supabase.from('message_logs').insert({
      instance_id: instance.id,
      direction: 'out',
      to_number: cleanTo,
      from_number: fromNum,
      body: message,
      status: 'sent',
      evolution_message_id: result.key?.id || null,
    });

    // 6. Increment quota counter
    if (subscription) {
      await supabase
        .from('subscriptions')
        .update({
          messages_sent_this_period: (subscription.messages_sent_this_period || 0) + 1,
        })
        .eq('id', subscription.id);
    }

    return NextResponse.json({
      success: true,
      messageId: result.key?.id,
      recipient: cleanTo,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
