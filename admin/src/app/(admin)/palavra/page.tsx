import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { NewMessageDialog } from './new-message-dialog';
import { MessageActions } from './message-actions';

export default async function PalavraPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('church_id').eq('id', user!.id).single();

  const { data: messages } = await supabase
    .from('weekly_messages')
    .select('*')
    .eq('church_id', profile!.church_id)
    .order('preached_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Palavra da Semana</h1>
          <p className="text-sm text-stone-500 mt-1">{messages?.length ?? 0} mensagens</p>
        </div>
        <NewMessageDialog churchId={profile!.church_id} />
      </div>

      <div className="space-y-3">
        {messages?.map((msg) => (
          <div key={msg.id} className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-stone-900 truncate">{msg.title}</h3>
                  {msg.published ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 shrink-0">Publicado</Badge>
                  ) : (
                    <Badge variant="outline" className="text-stone-500 shrink-0">Rascunho</Badge>
                  )}
                </div>
                <p className="text-sm text-stone-500 mb-2">
                  {new Date(msg.preached_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-sm text-stone-600 line-clamp-2">{msg.content}</p>
              </div>
              <MessageActions message={msg} churchId={profile!.church_id} />
            </div>
          </div>
        ))}
        {!messages?.length && (
          <div className="text-center py-12 text-stone-400 bg-white rounded-xl border border-stone-200">
            Nenhuma mensagem publicada ainda
          </div>
        )}
      </div>
    </div>
  );
}
