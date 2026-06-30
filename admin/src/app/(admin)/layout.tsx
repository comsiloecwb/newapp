import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, church_id')
    .eq('id', user.id)
    .single();

  const { data: church } = profile
    ? await supabase.from('churches').select('name').eq('id', profile.church_id).single()
    : { data: null };

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar churchName={church?.name ?? 'Igreja'} userName={profile?.name ?? ''} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
