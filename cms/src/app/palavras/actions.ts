'use server';

import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';

async function getAdminProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase
    .from('users').select('role, tenant_id').eq('id', user.id).single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) redirect('/login');
  return profile;
}

export async function createPalavra(formData: FormData) {
  const profile = await getAdminProfile();
  const db = createAdminClient();
  await db.from('palavras').insert({
    tenant_id: profile.tenant_id,
    titulo: formData.get('titulo') as string,
    texto: formData.get('texto') as string,
    pregador: (formData.get('pregador') as string) || null,
    versiculo: (formData.get('versiculo') as string) || null,
    data: formData.get('data') as string,
    published: formData.get('published') === 'true',
  });
  redirect('/palavras');
}

export async function updatePalavra(id: string, formData: FormData) {
  await getAdminProfile();
  const db = createAdminClient();
  await db.from('palavras').update({
    titulo: formData.get('titulo') as string,
    texto: formData.get('texto') as string,
    pregador: (formData.get('pregador') as string) || null,
    versiculo: (formData.get('versiculo') as string) || null,
    data: formData.get('data') as string,
    published: formData.get('published') === 'true',
  }).eq('id', id);
  redirect('/palavras');
}

export async function deletePalavra(id: string) {
  await getAdminProfile();
  const db = createAdminClient();
  await db.from('palavras').delete().eq('id', id);
  redirect('/palavras');
}
