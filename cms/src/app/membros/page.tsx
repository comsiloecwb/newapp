import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ApproveButton } from './ApproveButton';

const ROLE_LABEL: Record<string, string> = {
  superadmin: 'Superadmin', admin: 'Admin', member: 'Membro', visitor: 'Visitante',
};
const ROLE_COLOR: Record<string, string> = {
  superadmin: 'text-amber-400 bg-amber-950/40 border-amber-900',
  admin: 'text-blue-400 bg-blue-950/40 border-blue-900',
  member: 'text-green-400 bg-green-950/40 border-green-900',
  visitor: 'text-stone-400 bg-stone-900 border-stone-700',
};

export default async function MembrosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('role, tenant_id').eq('id', user.id).single();
  if (!profile) redirect('/login');

  const tenantId = profile.tenant_id;

  const [{ data: membros }, { data: solicitacoes }] = await Promise.all([
    supabase
      .from('users')
      .select('id, nome, email, role, is_lider, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false }),
    supabase
      .from('membership_requests')
      .select('id, user_id, status, created_at, users(nome, email)')
      .eq('tenant_id', tenantId)
      .eq('status', 'pendente')
      .order('created_at', { ascending: true }),
  ]);

  const pendentes = solicitacoes ?? [];

  return (
    <div className="p-8 space-y-10">
      {/* Solicitações pendentes */}
      {pendentes.length > 0 && (
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">
            Solicitações pendentes
            <span className="ml-2 text-xs font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full">
              {pendentes.length}
            </span>
          </h2>
          <div className="bg-stone-800/40 border border-amber-900/40 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-700">
                  <th className="text-left text-stone-400 font-medium px-6 py-4">Nome</th>
                  <th className="text-left text-stone-400 font-medium px-6 py-4">E-mail</th>
                  <th className="text-left text-stone-400 font-medium px-6 py-4">Data</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {pendentes.map((s) => {
                  const u = s.users as unknown as { nome: string; email: string } | null;
                  return (
                    <tr key={s.id} className="border-b border-stone-700/50">
                      <td className="px-6 py-4 text-white font-medium">{u?.nome ?? '—'}</td>
                      <td className="px-6 py-4 text-stone-400">{u?.email ?? '—'}</td>
                      <td className="px-6 py-4 text-stone-500">
                        {new Date(s.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          <ApproveButton requestId={s.id} action="aprovado" />
                          <ApproveButton requestId={s.id} action="negado" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lista de membros */}
      <div>
        <h2 className="text-white text-lg font-semibold mb-4">
          Membros <span className="text-stone-500 text-base font-normal">({membros?.length ?? 0})</span>
        </h2>
        <div className="bg-stone-800/40 border border-stone-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-700">
                <th className="text-left text-stone-400 font-medium px-6 py-4">Nome</th>
                <th className="text-left text-stone-400 font-medium px-6 py-4">E-mail</th>
                <th className="text-left text-stone-400 font-medium px-6 py-4">Papel</th>
                <th className="text-left text-stone-400 font-medium px-6 py-4">Líder</th>
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
                    {m.is_lider ? (
                      <span className="text-amber-400 text-xs font-medium">✓ Líder</span>
                    ) : (
                      <span className="text-stone-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-stone-500">
                    {new Date(m.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!membros || membros.length === 0) && (
            <div className="text-center py-16 text-stone-500">Nenhum membro cadastrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}
