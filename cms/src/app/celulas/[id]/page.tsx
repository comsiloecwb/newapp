import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { BackButton } from '@/components/BackButton';
import { Toast } from '@/components/Toast';
import { SubmitButton } from '@/components/SubmitButton';
import { updateCelula, deleteCelula, aprovarMembro, rejeitarMembro } from '../actions';

const DIAS = [
  { value: 'segunda', label: 'Segunda' }, { value: 'terca', label: 'Terça' },
  { value: 'quarta', label: 'Quarta' }, { value: 'quinta', label: 'Quinta' },
  { value: 'sexta', label: 'Sexta' }, { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

export default async function CelulaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('role, tenant_id').eq('id', user.id).single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) redirect('/login');

  const db = createAdminClient();

  const { data: celula } = await db
    .from('celulas')
    .select('id, nome, lider_nome, bairro, endereco_completo, dia_semana, horario, contato_telefone, tenant_id')
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
    .single();


  if (!celula) redirect('/celulas');

  const { data: membros } = await db
    .from('membros_celula')
    .select('id, status, created_at, user_id')
    .eq('celula_id', id)
    .order('created_at');

  const userIds = (membros ?? []).map((m) => m.user_id);
  const { data: usersData } = userIds.length > 0
    ? await db.from('users').select('id, nome, email').in('id', userIds)
    : { data: [] };

  const userMap = Object.fromEntries((usersData ?? []).map((u) => [u.id, u]));

  const pendentes = membros?.filter((m) => m.status === 'pendente') ?? [];
  const aprovados = membros?.filter((m) => m.status === 'aprovado') ?? [];

  const updateAction = updateCelula.bind(null, id);
  const deleteAction = deleteCelula.bind(null, id);

  return (
    <div className="p-8 max-w-2xl">
      <Toast />
      <BackButton href="/celulas" label="Voltar para Células" />

      <div className="flex items-center justify-between mt-4 mb-8">
        <h1 className="text-white text-2xl font-semibold">{celula.nome}</h1>
        <form action={deleteAction}>
          <button
            type="submit"
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
            onClick={(e) => { if (!confirm('Excluir esta célula?')) e.preventDefault(); }}
          >
            Excluir
          </button>
        </form>
      </div>

      {/* Editar informações */}
      <section className="bg-stone-800/40 border border-stone-700 rounded-xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-4">Informações</h2>
        <form action={updateAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">Nome *</label>
            <input
              name="nome" required defaultValue={celula.nome}
              className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">Nome do líder</label>
            <input
              name="lider_nome" defaultValue={celula.lider_nome ?? ''}
              className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Ex: João Silva"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">Dia</label>
              <select
                name="dia_semana" defaultValue={celula.dia_semana ?? ''}
                className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">Selecionar</option>
                {DIAS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">Horário</label>
              <input
                name="horario" defaultValue={celula.horario ?? ''}
                className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Ex: 19h30"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">Bairro</label>
            <input
              name="bairro" defaultValue={celula.bairro ?? ''}
              className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">Endereço completo</label>
            <input
              name="endereco_completo" defaultValue={celula.endereco_completo ?? ''}
              className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-stone-400 text-xs font-medium uppercase tracking-wide">Telefone</label>
            <input
              name="contato_telefone" defaultValue={celula.contato_telefone ?? ''}
              className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <SubmitButton label="Salvar alterações" pendingLabel="Salvando..." className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-stone-950 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors" />
        </form>
      </section>

      {/* Solicitações pendentes */}
      {pendentes.length > 0 && (
        <section className="bg-stone-800/40 border border-amber-500/30 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">
            Solicitações pendentes
            <span className="ml-2 bg-amber-500 text-stone-950 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendentes.length}
            </span>
          </h2>
          <div className="space-y-3">
            {pendentes.map((m) => {
              const u = userMap[m.user_id] ?? null;
              const aprovar = aprovarMembro.bind(null, m.id, id);
              const rejeitar = rejeitarMembro.bind(null, m.id, id);
              return (
                <div key={m.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-medium">{u?.nome ?? 'Desconhecido'}</p>
                    <p className="text-stone-500 text-xs">{u?.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={aprovar}>
                      <button className="bg-green-600 hover:bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                        Aprovar
                      </button>
                    </form>
                    <form action={rejeitar}>
                      <button className="bg-stone-700 hover:bg-red-900 text-stone-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                        Rejeitar
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Membros aprovados */}
      <section className="bg-stone-800/40 border border-stone-700 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Membros ({aprovados.length})</h2>
        {aprovados.length === 0 ? (
          <p className="text-stone-500 text-sm">Nenhum membro aprovado ainda.</p>
        ) : (
          <div className="space-y-3">
            {aprovados.map((m) => {
              const u = userMap[m.user_id] ?? null;
              const rejeitar = rejeitarMembro.bind(null, m.id, id);
              return (
                <div key={m.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-medium">{u?.nome ?? 'Desconhecido'}</p>
                    <p className="text-stone-500 text-xs">{u?.email}</p>
                  </div>
                  <form action={rejeitar}>
                    <button className="text-stone-500 hover:text-red-400 text-xs transition-colors">
                      Remover
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
