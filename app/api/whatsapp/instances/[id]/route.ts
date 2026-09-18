import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/src/lib/supabase/server';
import { evolutionApi } from '@/src/lib/evolution';

export async function DELETE(
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

    // 2. Delete instance from Evolution API
    await evolutionApi.deleteInstance(instance.instance_name).catch((err) => {
      console.warn('Evolution API delete warning:', err.message);
    });

    // 3. Delete from Supabase (cascades to message_logs)
    const { error: delError } = await supabase
      .from('whatsapp_instances')
      .delete()
      .eq('id', instanceId);

    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: instance.instance_name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
