import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const REDE_LABEL: Record<string, string> = {
  todos: 'Todos', homens: 'Homens', mulheres: 'Mulheres',
  jovem: 'Jovem', casais: 'Casais', kids: 'Kids',
};

export default async function EventosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('role, tenant_id').eq('id', user.id).single();
  if (!profile) redirect('/login');

  let query = supabase
    .from('eventos')
    .select('*')
    .order('start_at', { ascending: false });

  if (profile.role !== 'superadmin') {
    query = query.eq('tenant_id', profile.tenant_id);
  }

  const { data: eventos } = await query;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-semibold">Eventos</h1>
          <p className="text-stone-400 text-sm mt-1">{eventos?.length ?? 0} eventos</p>
        </div>
        <Link
          href="/eventos/novo"
          className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          + Novo evento
        </Link>
      </div>

      <div className="bg-stone-800/40 border border-stone-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-700">
              <th className="text-left text-stone-400 font-medium px-6 py-4">Título</th>
              <th className="text-left text-stone-400 font-medium px-6 py-4">Data</th>
              <th className="text-left text-stone-400 font-medium px-6 py-4">Rede</th>
              <th className="text-left text-stone-400 font-medium px-6 py-4">Tipo</th>
              <th className="text-left text-stone-400 font-medium px-6 py-4">Status</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {(eventos ?? []).map((evento) => (
              <tr key={evento.id} className="border-b border-stone-700/50 hover:bg-stone-700/20 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-white font-medium">{evento.titulo}</span>
                  {evento.location && (
                    <p className="text-stone-500 text-xs mt-0.5">{evento.location}</p>
                  )}
                </td>
                <td className="px-6 py-4 text-stone-300 whitespace-nowrap">
                  {formatDate(evento.start_at)}
                </td>
                <td className="px-6 py-4">
                  <span className="text-stone-400 text-xs">{REDE_LABEL[evento.rede] ?? evento.rede}</span>
                </td>
                <td className="px-6 py-4">
                  {evento.is_paid ? (
                    <span className="text-xs font-medium text-amber-400 bg-amber-950/40 border border-amber-900 px-2 py-0.5 rounded-full">
                      Pago · R$ {((evento.price_cents ?? 0) / 100).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-xs text-stone-500">Gratuito</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                    evento.published
                      ? 'bg-green-950/60 text-green-400 border border-green-900'
                      : 'bg-stone-900 text-stone-500 border border-stone-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${evento.published ? 'bg-green-400' : 'bg-stone-500'}`} />
                    {evento.published ? 'Publicado' : 'Rascunho'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/eventos/${evento.id}`}
                      className="text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
                    >
                      Editar
                    </Link>
                    <span className="text-stone-700">|</span>
                    <Link
                      href={`/eventos/${evento.id}/inscritos`}
                      className="text-stone-400 hover:text-white text-xs font-medium transition-colors"
                    >
                      Inscritos
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!eventos || eventos.length === 0) && (
          <div className="text-center py-16 text-stone-500">
            Nenhum evento cadastrado.{' '}
            <Link href="/eventos/novo" className="text-amber-400 hover:underline">Criar primeiro evento</Link>
          </div>
        )}
      </div>
    </div>
  );
}
