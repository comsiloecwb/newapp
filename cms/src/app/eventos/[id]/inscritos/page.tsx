import { redirect, notFound } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';

function statusLabel(status: string) {
  if (status === 'pago') return { label: 'Pago', cls: 'bg-green-900/40 text-green-400' };
  if (status === 'cancelado') return { label: 'Cancelado', cls: 'bg-red-900/40 text-red-400' };
  return { label: 'Pendente', cls: 'bg-amber-900/40 text-amber-400' };
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default async function InscritosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('role, tenant_id').eq('id', user.id).single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) redirect('/login');

  const db = createAdminClient();

  const { data: evento } = await db
    .from('eventos')
    .select('id, titulo, vagas_total, start_at')
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
    .single();

  if (!evento) notFound();

  const { data: inscritos } = await db
    .from('inscricoes')
    .select('id, status, checked_in_at, created_at, users(nome, email, telefone)')
    .eq('evento_id', id)
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false });

  const lista = inscritos ?? [];
  const ativos = lista.filter((i) => i.status !== 'cancelado');
  const checkins = lista.filter((i) => i.checked_in_at);

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <a href={`/eventos/${id}`} className="text-stone-400 hover:text-white text-sm transition-colors">
          ← Editar evento
        </a>
        <h1 className="text-white text-2xl font-semibold mt-3">{evento.titulo}</h1>
        <p className="text-stone-400 text-sm mt-1">
          {new Date(evento.start_at).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
          <p className="text-stone-400 text-xs font-medium uppercase tracking-wide mb-1">Inscritos</p>
          <p className="text-white text-3xl font-bold">{ativos.length}</p>
          {evento.vagas_total && (
            <p className="text-stone-500 text-xs mt-1">de {evento.vagas_total} vagas</p>
          )}
        </div>
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
          <p className="text-stone-400 text-xs font-medium uppercase tracking-wide mb-1">Check-ins</p>
          <p className="text-white text-3xl font-bold">{checkins.length}</p>
          <p className="text-stone-500 text-xs mt-1">presença confirmada</p>
        </div>
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
          <p className="text-stone-400 text-xs font-medium uppercase tracking-wide mb-1">Cancelados</p>
          <p className="text-white text-3xl font-bold">{lista.length - ativos.length}</p>
          <p className="text-stone-500 text-xs mt-1">desistiram</p>
        </div>
      </div>

      {/* Tabela */}
      {lista.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center">
          <p className="text-stone-400">Nenhum inscrito ainda.</p>
        </div>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800">
                <th className="text-left text-stone-400 font-medium px-5 py-3">Nome</th>
                <th className="text-left text-stone-400 font-medium px-5 py-3">E-mail</th>
                <th className="text-left text-stone-400 font-medium px-5 py-3">Status</th>
                <th className="text-left text-stone-400 font-medium px-5 py-3">Check-in</th>
                <th className="text-left text-stone-400 font-medium px-5 py-3">Inscrito em</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((i, idx) => {
                const u = i.users as { nome: string; email: string; telefone: string | null } | null;
                const { label, cls } = statusLabel(i.status);
                return (
                  <tr key={i.id} className={idx < lista.length - 1 ? 'border-b border-stone-800/60' : ''}>
                    <td className="px-5 py-3 text-white font-medium">{u?.nome ?? '—'}</td>
                    <td className="px-5 py-3 text-stone-400">{u?.email ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>{label}</span>
                    </td>
                    <td className="px-5 py-3 text-stone-400">
                      {i.checked_in_at ? (
                        <span className="text-green-400">{fmt(i.checked_in_at)}</span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3 text-stone-500">{fmt(i.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
