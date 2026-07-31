import { redirect, notFound } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Toast } from '@/components/Toast';
import { BackButton } from '@/components/BackButton';
import { deleteGrupo } from '../actions';

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
    .select('id, nome, created_at')
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
    .single();

  if (!grupo) notFound();

  const deleteAction = deleteGrupo.bind(null, id);

  return (
    <div className="p-8 max-w-xl">
      <Toast />
      <BackButton href="/grupos" label="Voltar para Grupos" />

      <div className="mt-4 mb-8">
        <h1 className="text-white text-2xl font-semibold">{grupo.nome}</h1>
        <p className="text-stone-500 text-sm mt-1">
          Criado em {new Date(grupo.created_at).toLocaleDateString('pt-BR')}
        </p>
      </div>

      <div className="bg-stone-800/30 border border-stone-700 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">🔒</span>
          <div>
            <p className="text-white font-medium text-sm">Grupo privado</p>
            <p className="text-stone-400 text-sm mt-1 leading-relaxed">
              Por privacidade, membros e mensagens deste grupo são visíveis apenas
              pelos participantes no app. O CMS não tem acesso ao conteúdo das conversas.
            </p>
          </div>
        </div>
      </div>

      <div className="border border-red-900/50 rounded-xl p-5">
        <h2 className="text-red-400 font-semibold mb-1">Excluir grupo</h2>
        <p className="text-stone-500 text-sm mb-4">
          Remove o grupo e todas as mensagens permanentemente. Essa ação não pode ser desfeita.
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
  );
}
