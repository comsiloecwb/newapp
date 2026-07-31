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

export async function createGrupo(formData: FormData) {
  const profile = await getAdminProfile();
  const db = createAdminClient();
  const { error } = await db.from('grupos').insert({
    tenant_id: profile.tenant_id,
    nome: formData.get('nome'),
  });
  if (error) throw new Error(error.message);
  revalidatePath('/grupos');
  redirect('/grupos?toast=criado');
}

export async function updateGrupo(id: string, formData: FormData) {
  const profile = await getAdminProfile();
  const db = createAdminClient();
  const { error } = await db.from('grupos').update({
    nome: formData.get('nome'),
  }).eq('id', id).eq('tenant_id', profile.tenant_id);
  if (error) throw new Error(error.message);
  revalidatePath('/grupos');
  revalidatePath(`/grupos/${id}`);
  redirect(`/grupos/${id}?toast=atualizado`);
}

export async function deleteGrupo(id: string) {
  const profile = await getAdminProfile();
  const db = createAdminClient();
  await db.from('grupos').delete().eq('id', id).eq('tenant_id', profile.tenant_id);
  revalidatePath('/grupos');
  redirect('/grupos?toast=excluido');
}

export async function addMembro(grupoId: string, userId: string) {
  await getAdminProfile();
  const db = createAdminClient();
  const { error } = await db.from('membros_grupo').insert({ grupo_id: grupoId, user_id: userId });
  if (error && !error.message.includes('duplicate')) throw new Error(error.message);
  revalidatePath(`/grupos/${grupoId}`);
}

export async function removeMembro(grupoId: string, userId: string) {
  await getAdminProfile();
  const db = createAdminClient();
  await db.from('membros_grupo').delete().eq('grupo_id', grupoId).eq('user_id', userId);
  revalidatePath(`/grupos/${grupoId}`);
}
