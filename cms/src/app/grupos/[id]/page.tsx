import { redirect, notFound } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Toast } from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';
import { BackButton } from '@/components/BackButton';
import { GrupoMembroRow } from './GrupoMembroRow';
import { AddMembroForm } from './AddMembroForm';
import { updateGrupo, deleteGrupo } from '../actions';

export default async function GrupoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('role, tenant_id').eq('id', user.id).single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) redirect('/login');

  const db = createAdminClient();

  const { data: grupo } = await db
    .from('grupos')
    .select('id, nome')
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
    .single();

  if (!grupo) notFound();

  // Membros atuais do grupo
  const { data: membros } = await db
    .from('membros_grupo')
    .select('user_id, joined_at, users(id, nome, email, role)')
    .eq('grupo_id', id)
    .order('joined_at', { ascending: true });

  const membroIds = new Set((membros ?? []).map((m) => m.user_id));

  // Todos os usuários do tenant que NÃO estão no grupo
  const { data: todos } = await db
    .from('users')
    .select('id, nome, email, role')
    .eq('tenant_id', profile.tenant_id)
    .neq('role', 'visitor')
    .order('nome', { ascending: true });

  const disponiveis = (todos ?? []).filter((u) => !membroIds.has(u.id));

  const updateAction = updateGrupo.bind(null, id);
  const deleteAction = deleteGrupo.bind(null, id);

  return (
    <div className="p-8 max-w-3xl">
      <Toast />
      <BackButton href="/grupos" label="Voltar para Grupos" />

      <div className="mt-4 mb-6">
        <h1 className="text-white text-2xl font-semibold">{grupo.nome}</h1>
        <p className="text-stone-400 text-sm mt-1">{(membros ?? []).length} membros</p>
      </div>

      <div className="grid gap-8">
        {/* Editar nome */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Nome do grupo</h2>
          <form action={updateAction} className="flex gap-3">
            <input
              name="nome"
              defaultValue={grupo.nome}
              required
              className="flex-1 bg-stone-800 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
            >
              Salvar
            </button>
          </form>
        </div>

        {/* Membros atuais */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-800">
            <h2 className="text-white font-semibold">Membros</h2>
          </div>
          {(membros ?? []).length === 0 ? (
            <p className="text-stone-500 text-sm px-5 py-8 text-center">Nenhum membro ainda.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="text-left text-stone-400 font-medium px-5 py-3">Nome</th>
                  <th className="text-left text-stone-400 font-medium px-5 py-3">E-mail</th>
                  <th className="text-left text-stone-400 font-medium px-5 py-3">Papel</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {(membros ?? []).map((m) => {
                  const u = (Array.isArray(m.users) ? m.users[0] : m.users) as {
                    id: string; nome: string; email: string; role: string;
                  } | null;
                  if (!u) return null;
                  return (
                    <GrupoMembroRow
                      key={m.user_id}
                      grupoId={id}
                      userId={m.user_id}
                      nome={u.nome}
                      email={u.email}
                      role={u.role}
                    />
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Adicionar membro */}
        <AddMembroForm grupoId={id} disponiveis={disponiveis} />

        {/* Zona de risco */}
        <div className="border border-red-900/50 rounded-xl p-5">
          <h2 className="text-red-400 font-semibold mb-1">Zona de risco</h2>
          <p className="text-stone-500 text-sm mb-4">
            Excluir o grupo remove todos os membros vinculados. Essa ação não pode ser desfeita.
          </p>
          <form action={deleteAction}>
            <button
              type="submit"
              className="bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-900 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Excluir grupo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
