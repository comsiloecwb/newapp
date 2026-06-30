import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, BookOpen, ClipboardList } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles').select('church_id').eq('id', user!.id).single();

  const churchId = profile?.church_id;

  const [events, members, messages, registrations] = await Promise.all([
    supabase.from('events').select('id', { count: 'exact' }).eq('church_id', churchId),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('church_id', churchId),
    supabase.from('weekly_messages').select('id', { count: 'exact' }).eq('church_id', churchId),
    supabase.from('registrations').select('id', { count: 'exact' }).eq('church_id', churchId),
  ]);

  const stats = [
    { label: 'Eventos', value: events.count ?? 0, icon: Calendar },
    { label: 'Membros', value: members.count ?? 0, icon: Users },
    { label: 'Mensagens', value: messages.count ?? 0, icon: BookOpen },
    { label: 'Inscrições', value: registrations.count ?? 0, icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
        <p className="text-sm text-stone-500 mt-1">Visão geral da sua igreja</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-stone-500">{label}</CardTitle>
              <Icon size={16} className="text-stone-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-stone-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
