'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import type { WeeklyMessage } from '@/types/database';

export function MessageActions({ message, churchId }: { message: WeeklyMessage; churchId: string }) {
  const router = useRouter();

  async function togglePublish() {
    const supabase = createClient();
    await supabase.from('weekly_messages').update({ published: !message.published }).eq('id', message.id);

    if (!message.published) {
      await supabase.functions.invoke('send-notification', {
        body: {
          church_id: churchId,
          title: '✝️ Palavra da Semana',
          body: message.title,
          data: { type: 'message', id: message.id },
        },
      });
    }

    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Excluir "${message.title}"?`)) return;
    const supabase = createClient();
    await supabase.from('weekly_messages').delete().eq('id', message.id);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Button variant="outline" size="sm" onClick={togglePublish}>
        {message.published ? 'Despublicar' : 'Publicar'}
      </Button>
      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
        Excluir
      </Button>
    </div>
  );
}
