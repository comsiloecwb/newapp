import { useQuery } from '@tanstack/react-query';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { Event } from '@/types/database';

type EventFilter = 'upcoming' | 'past';

export function useEvents(filter: EventFilter = 'upcoming') {
  const churchId = useAuthStore((s) => s.church?.id);
  const now = new Date().toISOString();

  return useQuery({
    queryKey: ['events', filter, churchId],
    enabled: Boolean(churchId) && isSupabaseConfigured,
    queryFn: async (): Promise<Event[]> => {
      let q = supabase
        .from('events')
        .select('*')
        .eq('church_id', churchId!)
        .eq('published', true);

      q =
        filter === 'upcoming'
          ? q.gte('start_at', now).order('start_at', { ascending: true })
          : q.lt('start_at', now).order('start_at', { ascending: false });

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Event[];
    },
  });
}

export function useUpcomingEvents(limit = 5) {
  const query = useEvents('upcoming');
  return {
    ...query,
    data: query.data?.slice(0, limit),
  };
}

export function useEventById(id: string | undefined) {
  const churchId = useAuthStore((s) => s.church?.id);

  return useQuery({
    queryKey: ['event', id],
    enabled: Boolean(id && churchId && isSupabaseConfigured),
    queryFn: async (): Promise<Event | null> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id!)
        .eq('church_id', churchId!)
        .single();
      if (error) return null;
      return data as Event;
    },
  });
}
