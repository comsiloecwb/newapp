import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCmsBranding, getUserTenantBranding } from '@/lib/tenant';
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

  // Superadmin vê o branding do CMS (Inovacao Pray ou o tenant fixado no env)
  // Admin vê o branding da própria igreja
  const branding = profile.role === 'superadmin'
    ? await getCmsBranding()
    : await getUserTenantBranding(profile.tenant_id);

  return (
    <div className="flex min-h-screen bg-stone-900">
      <Sidebar role={profile.role as 'admin' | 'superadmin'} branding={branding} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
