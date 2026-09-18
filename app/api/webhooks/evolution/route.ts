import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { evolutionApi } from '@/src/lib/evolution';
import { decrypt } from '@/src/lib/encryption';

/**
 * Evolution API Webhook Receiver
 * Listens for:
 * 1. CONNECTION_UPDATE -> updates instance status to connected/disconnected
 * 2. MESSAGES_UPSERT   -> logs incoming message, checks keyword automations, and auto-replies!
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const event = (payload.event || payload.type || '').toUpperCase();
    const instanceName = payload.instance || payload.instanceName || payload.data?.instance;

    if (!instanceName) {
      return NextResponse.json({ received: true, note: 'No instance name in webhook' });
    }

    // 1. Look up the instance in Supabase
    const { data: instance, error: instError } = await supabaseAdmin
      .from('whatsapp_instances')
      .select('*')
      .eq('instance_name', instanceName)
      .single();

    if (instError || !instance) {
      console.warn(`Webhook received for unknown instance: ${instanceName}`);
      return NextResponse.json({ received: true, note: 'Instance not found in database' });
    }

    // 2. Handle Connection State Changes (CONNECTION_UPDATE)
    if (event.includes('CONNECTION') || event === 'CONNECTION_UPDATE' || payload.data?.state) {
      const state = payload.data?.state || payload.state;
      
      if (state === 'open') {
        const updateData: any = {
          status: 'connected',
          connected_at: new Date().toISOString(),
        };

        // Extract phone number if provided by Evolution payload
        const ownerJid = payload.data?.ownerJid || payload.sender;
        if (ownerJid) {
          updateData.phone_number = ownerJid.replace('@s.whatsapp.net', '').replace(/\D/g, '');
        }

        await supabaseAdmin
          .from('whatsapp_instances')
          .update(updateData)
          .eq('id', instance.id);

        console.log(`[Webhook] Instance ${instanceName} is now CONNECTED.`);
      } else if (state === 'close') {
        await supabaseAdmin
          .from('whatsapp_instances')
          .update({ status: 'disconnected' })
          .eq('id', instance.id);

        console.log(`[Webhook] Instance ${instanceName} is now DISCONNECTED.`);
      }
    }

    // 3. Handle Incoming Messages (MESSAGES_UPSERT)
    if (event.includes('MESSAGES') || event === 'MESSAGES_UPSERT') {
      const messageData = payload.data?.message || payload.data;
      const key = payload.data?.key || {};

      // Ignore messages sent by ourselves
      if (key.fromMe) {
        return NextResponse.json({ received: true, ignored: 'Outbound message from bot' });
      }

      // Extract sender phone number
      const remoteJid = key.remoteJid || payload.data?.remoteJid || '';
      if (!remoteJid || remoteJid.includes('@g.us')) {
        // Skip group messages for MVP keyword auto-responder unless requested
        return NextResponse.json({ received: true, ignored: 'Group or empty JID' });
      }

      const senderNumber = remoteJid.replace('@s.whatsapp.net', '').replace(/\D/g, '');

      // Extract message text body
      const body =
        messageData?.conversation ||
        messageData?.extendedTextMessage?.text ||
        messageData?.imageMessage?.caption ||
        messageData?.buttonsResponseMessage?.selectedButtonId ||
        '';

      if (!body) {
        return NextResponse.json({ received: true, note: 'Non-text message' });
      }

      // A. Log incoming message to message_logs
      await supabaseAdmin.from('message_logs').insert({
        instance_id: instance.id,
        direction: 'in',
        to_number: instance.phone_number || instance.instance_name,
        from_number: senderNumber,
        body,
        status: 'received',
        evolution_message_id: key.id || null,
      });

      // B. Query active keyword automations for this tenant / instance
      const { data: automations } = await supabaseAdmin
        .from('automations')
        .select('*')
        .eq('user_id', instance.user_id)
        .eq('enabled', true)
        .eq('trigger_type', 'keyword');

      if (automations && automations.length > 0) {
        const cleanMsg = body.trim().toLowerCase();

        for (const auto of automations) {
          // Check if instance_id matches or is wildcard (applies to all tenant instances)
          if (auto.instance_id && auto.instance_id !== instance.id) {
            continue;
          }

          const keyword = (auto.trigger_config?.keyword || '').trim().toLowerCase();
          const matchType = auto.trigger_config?.match_type || 'contains';
          let isMatch = false;

          if (matchType === 'exact') {
            isMatch = cleanMsg === keyword;
          } else if (matchType === 'starts_with') {
            isMatch = cleanMsg.startsWith(keyword);
          } else {
            // Default to 'contains'
            isMatch = cleanMsg.includes(keyword);
          }

          if (isMatch && auto.action_config?.reply_text) {
            const replyText = auto.action_config.reply_text;
            const perInstanceToken = instance.evolution_token ? decrypt(instance.evolution_token) : undefined;

            try {
              // Send the auto-reply via Evolution API
              const sendResult = await evolutionApi.sendTextMessage(
                instance.instance_name,
                senderNumber,
                replyText,
                perInstanceToken
              );

              // Log outgoing auto-reply to message_logs
              await supabaseAdmin.from('message_logs').insert({
                instance_id: instance.id,
                direction: 'out',
                to_number: senderNumber,
                from_number: instance.phone_number || instance.instance_name,
                body: replyText,
                status: 'sent',
                evolution_message_id: sendResult.key?.id || null,
              });

              // Increment subscription message usage
              const { data: sub } = await supabaseAdmin
                .from('subscriptions')
                .select('id, messages_sent_this_period')
                .eq('user_id', instance.user_id)
                .single();

              if (sub) {
                await supabaseAdmin
                  .from('subscriptions')
                  .update({
                    messages_sent_this_period: (sub.messages_sent_this_period || 0) + 1,
                  })
                  .eq('id', sub.id);
              }

              console.log(`[Automation] Triggered "${auto.name}" -> Replied to ${senderNumber}`);
              break; // Prevent multiple auto-replies for the same message
            } catch (autoErr: any) {
              console.error(`[Automation Error] Failed to send auto-reply:`, autoErr.message);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, event, instance: instanceName });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
