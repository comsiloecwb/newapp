import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BulkApprovePanel } from './BulkApprovePanel';
import { LiderToggle } from './LiderToggle';

const ROLE_LABEL: Record<string, string> = {
  superadmin: 'Superadmin', admin: 'Admin', member: 'Membro', visitor: 'Visitante',
};
const ROLE_COLOR: Record<string, string> = {
  superadmin: 'text-amber-400 bg-amber-950/40 border-amber-900',
  admin: 'text-blue-400 bg-blue-950/40 border-blue-900',
  member: 'text-green-400 bg-green-950/40 border-green-900',
  visitor: 'text-stone-400 bg-stone-900 border-stone-700',
};

interface Props {
  searchParams: Promise<{ role?: string; lider?: string; q?: string }>;
}

export default async function MembrosPage({ searchParams }: Props) {
  const filters = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('role, tenant_id').eq('id', user.id).single();
  if (!profile) redirect('/login');

  const tenantId = profile.tenant_id;

  let query = supabase
    .from('users')
    .select('id, nome, email, role, is_lider, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (filters.role) query = query.eq('role', filters.role);
  if (filters.lider === 'true') query = query.eq('is_lider', true);
  if (filters.q) query = query.ilike('nome', `%${filters.q}%`);

  const [{ data: membros }, { data: solicitacoes }] = await Promise.all([
    query,
    supabase
      .from('membership_requests')
      .select('id, user_id, status, created_at, users(nome, email)')
      .eq('tenant_id', tenantId)
      .eq('status', 'pendente')
      .order('created_at', { ascending: true }),
  ]);

  const pendentes = (solicitacoes ?? []).map((s) => {
    const u = s.users as unknown as { nome: string; email: string } | null;
    return { id: s.id, nome: u?.nome ?? '—', email: u?.email ?? '—', created_at: s.created_at };
  });

  return (
    <div className="p-8 space-y-10">
      <BulkApprovePanel solicitacoes={pendentes} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-semibold">
            Membros <span className="text-stone-500 text-base font-normal">({membros?.length ?? 0})</span>
          </h2>
        </div>

        {/* Filtros */}
        <form method="GET" className="flex flex-wrap gap-3 mb-5">
          <input
            name="q"
            defaultValue={filters.q ?? ''}
            placeholder="Buscar por nome..."
            className="bg-stone-800 border border-stone-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 w-52"
          />
          <select
            name="role"
            defaultValue={filters.role ?? ''}
            className="bg-stone-800 border border-stone-700 text-stone-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos os papéis</option>
            <option value="admin">Admin</option>
            <option value="member">Membro</option>
            <option value="visitor">Visitante</option>
          </select>
          <select
            name="lider"
            defaultValue={filters.lider ?? ''}
            className="bg-stone-800 border border-stone-700 text-stone-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos</option>
            <option value="true">Apenas líderes</option>
          </select>
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Filtrar
          </button>
          {(filters.role || filters.lider || filters.q) && (
            <a
              href="/membros"
              className="text-stone-400 hover:text-white text-sm px-4 py-2 rounded-lg border border-stone-700 hover:border-stone-500 transition-colors"
            >
              Limpar
            </a>
          )}
        </form>

        <div className="bg-stone-800/40 border border-stone-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-700">
                <th className="text-left text-stone-400 font-medium px-6 py-4">Nome</th>
                <th className="text-left text-stone-400 font-medium px-6 py-4">E-mail</th>
                <th className="text-left text-stone-400 font-medium px-6 py-4">Papel</th>
                <th className="text-left text-stone-400 font-medium px-6 py-4">Liderança</th>
                <th className="text-left text-stone-400 font-medium px-6 py-4">Desde</th>
              </tr>
            </thead>
            <tbody>
              {(membros ?? []).map((m) => (
                <tr key={m.id} className="border-b border-stone-700/50 hover:bg-stone-700/20 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{m.nome}</td>
                  <td className="px-6 py-4 text-stone-400">{m.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${ROLE_COLOR[m.role] ?? ROLE_COLOR.visitor}`}>
                      {ROLE_LABEL[m.role] ?? m.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <LiderToggle userId={m.id} isLider={m.is_lider ?? false} />
                  </td>
                  <td className="px-6 py-4 text-stone-500">
                    {new Date(m.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!membros || membros.length === 0) && (
            <div className="text-center py-16 text-stone-500">Nenhum membro encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}
