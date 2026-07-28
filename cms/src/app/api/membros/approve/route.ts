import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  const { request_id, action } = await req.json();

  const db = createAdminClient();

  const { data: solicitacao } = await db
    .from('membership_requests').select('user_id').eq('id', request_id).single();

  if (!solicitacao) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  await db.from('membership_requests').update({ status: action }).eq('id', request_id);

  if (action === 'aprovado') {
    await db.from('users').update({ role: 'member' }).eq('id', solicitacao.user_id).eq('role', 'visitor');
  }

  return NextResponse.json({ ok: true });
}
