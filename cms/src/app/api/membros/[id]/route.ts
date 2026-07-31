import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

async function getAdminProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('users').select('role, tenant_id').eq('id', user.id).single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) return null;
  return profile;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const profile = await getAdminProfile();
  if (!profile) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });

  const body = await req.json();
  const { nome, role } = body;

  const db = createAdminClient();

  // Verifica que o membro pertence ao mesmo tenant
  const { data: membro } = await db.from('users').select('tenant_id').eq('id', id).single();
  if (!membro || membro.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  }

  const update: Record<string, string> = {};
  if (nome) update.nome = nome;
  if (role && ['visitor', 'member', 'admin'].includes(role)) update.role = role;

  const { error } = await db.from('users').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const profile = await getAdminProfile();
  if (!profile) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });

  const db = createAdminClient();

  // Verifica que o membro pertence ao mesmo tenant e não é superadmin
  const { data: membro } = await db.from('users').select('tenant_id, role').eq('id', id).single();
  if (!membro || membro.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  }
  if (membro.role === 'superadmin') {
    return NextResponse.json({ error: 'Não é possível excluir superadmin' }, { status: 403 });
  }

  // Deleta da tabela users e do Supabase Auth
  await db.from('users').delete().eq('id', id);
  await db.auth.admin.deleteUser(id);

  return NextResponse.json({ ok: true });
}
