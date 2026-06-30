'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import type { Event } from '@/types/database';

export function EventActions({ event, churchId }: { event: Event; churchId: string }) {
  const router = useRouter();

  async function togglePublish() {
    const supabase = createClient();
    await supabase.from('events').update({ published: !event.published }).eq('id', event.id);

    if (!event.published) {
      await supabase.functions.invoke('send-notification', {
        body: {
          church_id: churchId,
          title: '📅 Novo evento',
          body: event.title,
          data: { type: 'event', id: event.id },
        },
      });
    }

    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Excluir "${event.title}"?`)) return;
    const supabase = createClient();
    await supabase.from('events').delete().eq('id', event.id);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={togglePublish}>
        {event.published ? 'Despublicar' : 'Publicar'}
      </Button>
      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
        Excluir
      </Button>
    </div>
  );
}
