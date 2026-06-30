import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';

export default async function InscricoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('church_id').eq('id', user!.id).single();

  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      id, status, created_at,
      profiles:user_id ( name, email ),
      events:event_id ( title, start_at )
    `)
    .eq('church_id', profile!.church_id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Inscrições</h1>
        <p className="text-sm text-stone-500 mt-1">{registrations?.length ?? 0} inscrições</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              <th className="text-left px-4 py-3 text-stone-500 font-medium">Membro</th>
              <th className="text-left px-4 py-3 text-stone-500 font-medium">Evento</th>
              <th className="text-left px-4 py-3 text-stone-500 font-medium">Data</th>
              <th className="text-left px-4 py-3 text-stone-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {registrations?.map((reg) => {
              const member = (Array.isArray(reg.profiles) ? reg.profiles[0] : reg.profiles) as { name: string; email: string } | null;
              const event = (Array.isArray(reg.events) ? reg.events[0] : reg.events) as { title: string; start_at: string } | null;
              return (
                <tr key={reg.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900">{member?.name ?? '—'}</p>
                    <p className="text-xs text-stone-400">{member?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-stone-900">{event?.title ?? '—'}</p>
                    {event?.start_at && (
                      <p className="text-xs text-stone-400">
                        {new Date(event.start_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {new Date(reg.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    {reg.status === 'confirmed' ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmado</Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-200">Cancelado</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!registrations?.length && (
          <div className="text-center py-12 text-stone-400">Nenhuma inscrição ainda</div>
        )}
      </div>
    </div>
  );
}
