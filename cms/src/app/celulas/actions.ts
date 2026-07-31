'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';

async function getAdminProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { data: profile } = await supabase
    .from('users').select('role, tenant_id').eq('id', user.id).single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) throw new Error('Sem permissão');
  return profile;
}

export async function createCelula(formData: FormData) {
  const profile = await getAdminProfile();
  const db = createAdminClient();
  const { error } = await db.from('celulas').insert({
    tenant_id: profile.tenant_id,
    nome: formData.get('nome'),
    bairro: formData.get('bairro') || null,
    endereco_completo: formData.get('endereco_completo') || null,
    dia_semana: formData.get('dia_semana') || null,
    horario: formData.get('horario') || null,
    contato_telefone: formData.get('contato_telefone') || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/celulas');
  redirect('/celulas?toast=criado');
}

export async function updateCelula(id: string, formData: FormData) {
  const profile = await getAdminProfile();
  const db = createAdminClient();
  const { error } = await db.from('celulas').update({
    nome: formData.get('nome'),
    bairro: formData.get('bairro') || null,
    endereco_completo: formData.get('endereco_completo') || null,
    dia_semana: formData.get('dia_semana') || null,
    horario: formData.get('horario') || null,
    contato_telefone: formData.get('contato_telefone') || null,
  }).eq('id', id).eq('tenant_id', profile.tenant_id);
  if (error) throw new Error(error.message);
  revalidatePath('/celulas');
  revalidatePath(`/celulas/${id}`);
  redirect(`/celulas/${id}?toast=atualizado`);
}

export async function deleteCelula(id: string) {
  const profile = await getAdminProfile();
  const db = createAdminClient();
  await db.from('celulas').delete().eq('id', id).eq('tenant_id', profile.tenant_id);
  revalidatePath('/celulas');
  redirect('/celulas?toast=excluido');
}

export async function aprovarMembro(membroId: string, celulaId: string) {
  await getAdminProfile();
  const db = createAdminClient();
  const { error } = await db.from('membros_celula').update({ status: 'aprovado' }).eq('id', membroId);
  if (error) throw new Error(error.message);
  revalidatePath(`/celulas/${celulaId}`);
}

export async function rejeitarMembro(membroId: string, celulaId: string) {
  await getAdminProfile();
  const db = createAdminClient();
  await db.from('membros_celula').delete().eq('id', membroId);
  revalidatePath(`/celulas/${celulaId}`);
}
