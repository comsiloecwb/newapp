import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('users')
    .select('role, tenant_id, nome')
    .eq('id', user!.id)
    .single();

  const isSuperAdmin = profile?.role === 'superadmin';

  // Stats do tenant atual (para admin) ou global (para superadmin)
  let stats = { membros: 0, eventos: 0, celulas: 0 };

  if (isSuperAdmin) {
    const [{ count: membros }, { count: eventos }, { count: tenants }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('eventos').select('*', { count: 'exact', head: true }),
      supabase.from('tenants').select('*', { count: 'exact', head: true }),
    ]);
    stats = { membros: membros ?? 0, eventos: eventos ?? 0, celulas: tenants ?? 0 };
  } else {
    const tenantId = profile?.tenant_id;
    const [{ count: membros }, { count: eventos }, { count: celulas }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId!),
      supabase.from('eventos').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId!),
      supabase.from('celulas').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId!),
    ]);
    stats = { membros: membros ?? 0, eventos: eventos ?? 0, celulas: celulas ?? 0 };
  }

  const cards = isSuperAdmin
    ? [
        { label: 'Total de membros', value: stats.membros, icon: '👥' },
        { label: 'Total de eventos', value: stats.eventos, icon: '📅' },
        { label: 'Igrejas ativas', value: stats.celulas, icon: '⛪' },
      ]
    : [
        { label: 'Membros', value: stats.membros, icon: '👥' },
        { label: 'Eventos', value: stats.eventos, icon: '📅' },
        { label: 'Células', value: stats.celulas, icon: '🏠' },
      ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-semibold">
          Olá, {profile?.nome?.split(' ')[0] ?? 'Admin'} 👋
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          {isSuperAdmin ? 'Visão geral de toda a plataforma' : 'Visão geral da sua igreja'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-stone-800/60 border border-stone-700 rounded-xl p-6">
            <div className="text-2xl mb-3">{card.icon}</div>
            <div className="text-3xl font-bold text-white">{card.value}</div>
            <div className="text-stone-400 text-sm mt-1">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
