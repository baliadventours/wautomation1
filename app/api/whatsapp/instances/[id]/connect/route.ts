import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase/server';
import { evolutionApi } from '@/src/lib/evolution';

export async function GET(
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
    const { searchParams } = new URL(req.url);
    const phoneNumber = searchParams.get('phoneNumber') || undefined;

    // 1. Verify tenant owns this instance via RLS query
    const { data: instance, error: fetchError } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .eq('id', instanceId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !instance) {
      return NextResponse.json({ error: 'Instance not found or access denied' }, { status: 404 });
    }

    // 2. Query Evolution API for connection state
    const stateResult = await evolutionApi.getConnectionState(instance.instance_name);
    const currentState = stateResult.instance?.state || 'close';

    // 3. If connected in Evolution API, ensure DB is synced
    if (currentState === 'open' && instance.status !== 'connected') {
      await supabase
        .from('whatsapp_instances')
        .update({
          status: 'connected',
          connected_at: new Date().toISOString(),
        })
        .eq('id', instanceId);

      return NextResponse.json({
        status: 'connected',
        state: 'open',
        instance: { ...instance, status: 'connected' },
      });
    }

    // 4. If not connected, fetch fresh QR code or Pairing Code
    let qrData = null;
    try {
      qrData = await evolutionApi.getConnectQr(instance.instance_name, phoneNumber);
    } catch (qrErr: any) {
      console.warn('QR retrieval notice:', qrErr.message);
    }

    return NextResponse.json({
      status: instance.status,
      state: currentState,
      qrcode: qrData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
