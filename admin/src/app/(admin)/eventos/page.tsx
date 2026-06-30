import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { EventActions } from './event-actions';
import { NewEventDialog } from './new-event-dialog';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default async function EventosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('church_id').eq('id', user!.id).single();

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('church_id', profile!.church_id)
    .order('start_at', { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Eventos</h1>
          <p className="text-sm text-stone-500 mt-1">{events?.length ?? 0} eventos cadastrados</p>
        </div>
        <NewEventDialog churchId={profile!.church_id} />
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              <th className="text-left px-4 py-3 text-stone-500 font-medium">Evento</th>
              <th className="text-left px-4 py-3 text-stone-500 font-medium">Data</th>
              <th className="text-left px-4 py-3 text-stone-500 font-medium">Local</th>
              <th className="text-left px-4 py-3 text-stone-500 font-medium">Tipo</th>
              <th className="text-left px-4 py-3 text-stone-500 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {events?.map((event) => (
              <tr key={event.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">{event.title}</td>
                <td className="px-4 py-3 text-stone-600">{formatDate(event.start_at)}</td>
                <td className="px-4 py-3 text-stone-600">{event.location || '—'}</td>
                <td className="px-4 py-3">
                  {event.is_paid ? (
                    <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                      Pago · R$ {((event.price_cents ?? 0) / 100).toFixed(2)}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-stone-600">Gratuito</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  {event.published ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Publicado</Badge>
                  ) : (
                    <Badge variant="outline" className="text-stone-500">Rascunho</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <EventActions event={event} churchId={profile!.church_id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!events?.length && (
          <div className="text-center py-12 text-stone-400">Nenhum evento cadastrado ainda</div>
        )}
      </div>
    </div>
  );
}
