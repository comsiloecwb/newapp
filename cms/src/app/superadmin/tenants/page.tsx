import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function TenantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user!.id).single();

  if (profile?.role !== 'superadmin') redirect('/dashboard');

  const { data: tenants } = await supabase
    .from('tenants')
    .select(`
      id, nome, slug, ativo, created_at,
      users(count)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-semibold">Igrejas</h1>
          <p className="text-stone-400 text-sm mt-1">{tenants?.length ?? 0} igrejas cadastradas</p>
        </div>
        <button className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors">
          + Nova igreja
        </button>
      </div>

      <div className="bg-stone-800/40 border border-stone-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-700">
              <th className="text-left text-stone-400 font-medium px-6 py-4">Igreja</th>
              <th className="text-left text-stone-400 font-medium px-6 py-4">Slug</th>
              <th className="text-left text-stone-400 font-medium px-6 py-4">Membros</th>
              <th className="text-left text-stone-400 font-medium px-6 py-4">Status</th>
              <th className="text-left text-stone-400 font-medium px-6 py-4">Criada em</th>
            </tr>
          </thead>
          <tbody>
            {(tenants ?? []).map((tenant) => {
              const memberCount = (tenant.users as unknown as { count: number }[])?.[0]?.count ?? 0;
              return (
                <tr key={tenant.id} className="border-b border-stone-700/50 hover:bg-stone-700/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{tenant.nome}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-stone-400 font-mono text-xs">{tenant.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-stone-300">{memberCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      tenant.ativo
                        ? 'bg-green-950/60 text-green-400 border border-green-900'
                        : 'bg-stone-900 text-stone-500 border border-stone-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tenant.ativo ? 'bg-green-400' : 'bg-stone-500'}`} />
                      {tenant.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-stone-400">
                      {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(!tenants || tenants.length === 0) && (
          <div className="text-center py-16 text-stone-500">
            Nenhuma igreja cadastrada ainda.
          </div>
        )}
      </div>
    </div>
  );
}
