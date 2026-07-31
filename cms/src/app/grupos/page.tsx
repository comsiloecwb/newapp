import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Toast } from '@/components/Toast';

export default async function GruposPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('role, tenant_id').eq('id', user.id).single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) redirect('/login');

  const db = createAdminClient();
  const { data: grupos } = await db
    .from('grupos')
    .select('id, nome, created_at')
    .eq('tenant_id', profile.tenant_id)
    .order('nome', { ascending: true });

  return (
    <div className="p-8">
      <Toast />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-semibold">Grupos</h1>
          <p className="text-stone-400 text-sm mt-1">{grupos?.length ?? 0} grupos</p>
        </div>
        <Link
          href="/grupos/novo"
          className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          + Novo grupo
        </Link>
      </div>

      {(!grupos || grupos.length === 0) ? (
        <div className="bg-stone-800/40 border border-stone-700 rounded-xl p-16 text-center">
          <p className="text-stone-400 mb-2">Nenhum grupo criado ainda.</p>
          <Link href="/grupos/novo" className="text-amber-400 hover:underline text-sm">
            Criar primeiro grupo
          </Link>
        </div>
      ) : (
        <div className="bg-stone-800/40 border border-stone-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-700">
                <th className="text-left text-stone-400 font-medium px-6 py-4">Nome</th>
                <th className="text-left text-stone-400 font-medium px-6 py-4">Criado em</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {grupos.map((g) => (
                <tr key={g.id} className="border-b border-stone-700/50 hover:bg-stone-700/20 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{g.nome}</td>
                  <td className="px-6 py-4 text-stone-400">{new Date(g.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/grupos/${g.id}`}
                      className="text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
