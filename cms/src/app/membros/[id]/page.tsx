import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { MembroEditForm } from './MembroEditForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MembroEditPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('role, tenant_id').eq('id', user.id).single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) redirect('/login');

  const db = createAdminClient();
  const { data: membro } = await db
    .from('users')
    .select('id, nome, email, role, is_lider, created_at, tenant_id')
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
    .single();

  if (!membro) redirect('/membros');

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <a href="/membros" className="text-stone-400 hover:text-white text-sm transition-colors">
          ← Membros
        </a>
        <h1 className="text-white text-2xl font-semibold mt-3">{membro.nome}</h1>
        <p className="text-stone-400 text-sm mt-1">{membro.email}</p>
      </div>

      <MembroEditForm membro={membro} currentUserRole={profile.role} />
    </div>
  );
}
