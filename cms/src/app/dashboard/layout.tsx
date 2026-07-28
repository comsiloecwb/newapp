import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
    redirect('/login?error=unauthorized');
  }

  let tenantNome: string | null = null;
  if (profile.role === 'admin' && profile.tenant_id) {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('nome')
      .eq('id', profile.tenant_id)
      .single();
    tenantNome = tenant?.nome ?? null;
  }

  return (
    <div className="flex min-h-screen bg-stone-900">
      <Sidebar role={profile.role as 'admin' | 'superadmin'} tenantNome={tenantNome} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
