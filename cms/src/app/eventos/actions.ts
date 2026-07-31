'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function createEvento(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { data: profile } = await supabase
    .from('users').select('role, tenant_id').eq('id', user.id).single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    throw new Error('Sem permissão');
  }

  const isPaid = formData.get('is_paid') === 'true';
  const priceCents = isPaid
    ? Math.round(parseFloat(String(formData.get('price') || '0')) * 100)
    : null;

  if (isPaid && (!priceCents || priceCents <= 0)) {
    throw new Error('Informe o valor do ingresso para eventos pagos');
  }

  const db = createAdminClient();
  const { error } = await db.from('eventos').insert({
    tenant_id: profile.tenant_id,
    titulo: formData.get('titulo'),
    descricao: formData.get('descricao') || null,
    start_at: formData.get('start_at'),
    end_at: formData.get('end_at') || null,
    location: formData.get('location') || null,
    rede: formData.get('rede') || 'todos',
    is_paid: formData.get('is_paid') === 'true',
    price_cents: priceCents,
    vagas_total: formData.get('vagas_total') ? parseInt(String(formData.get('vagas_total'))) : null,
    vagas_alerta: formData.get('vagas_alerta') ? parseInt(String(formData.get('vagas_alerta'))) : null,
    published: formData.get('published') === 'true',
    created_by: user.id,
  }).select().single();

  if (error) throw new Error(error.message);

  revalidatePath('/eventos');
  redirect('/eventos?toast=criado');
}

export async function updateEvento(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const isPaid = formData.get('is_paid') === 'true';
  const priceCents = isPaid
    ? Math.round(parseFloat(String(formData.get('price') || '0')) * 100)
    : null;

  if (isPaid && (!priceCents || priceCents <= 0)) {
    throw new Error('Informe o valor do ingresso para eventos pagos');
  }

  const db = createAdminClient();
  const { error } = await db.from('eventos').update({
    titulo: formData.get('titulo'),
    descricao: formData.get('descricao') || null,
    start_at: formData.get('start_at'),
    end_at: formData.get('end_at') || null,
    location: formData.get('location') || null,
    rede: formData.get('rede') || 'todos',
    is_paid: formData.get('is_paid') === 'true',
    price_cents: priceCents,
    vagas_total: formData.get('vagas_total') ? parseInt(String(formData.get('vagas_total'))) : null,
    vagas_alerta: formData.get('vagas_alerta') ? parseInt(String(formData.get('vagas_alerta'))) : null,
    published: formData.get('published') === 'true',
  }).eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/eventos');
  redirect('/eventos?toast=atualizado');
}

export async function deleteEvento(id: string) {
  const db = createAdminClient();
  await db.from('eventos').delete().eq('id', id);
  revalidatePath('/eventos');
  redirect('/eventos?toast=excluido');
}
