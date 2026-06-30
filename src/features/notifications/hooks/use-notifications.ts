import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { MOCK_NOTIFICATIONS } from '@/lib/mock-data';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useNotificationsStore } from '@/stores/notifications-store';
import { useAuthStore } from '@/stores/auth-store';
import type { InAppNotification } from '@/types/database';

const QUERY_KEY = 'notifications';

export function useNotifications() {
  const userId = useAuthStore((s) => s.profile?.id);
  const setUnreadCount = useNotificationsStore((s) => s.setUnreadCount);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY, userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<InAppNotification[]> => {
      if (!isSupabaseConfigured) return MOCK_NOTIFICATIONS;

      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data ?? []) as InAppNotification[];
    },
  });

  // Sincroniza contador de não lidos
  useEffect(() => {
    if (query.data) {
      setUnreadCount(query.data.filter((n) => !n.read).length);
    }
  }, [query.data, setUnreadCount]);

  // Realtime: novas notificações chegam em tempo real
  useEffect(() => {
    if (!isSupabaseConfigured || !userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'in_app_notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY, userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return query;
}

export function useMarkAsRead() {
  const userId = useAuthStore((s) => s.profile?.id);
  const decrement = useNotificationsStore((s) => s.decrement);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!isSupabaseConfigured) return;

      const { error } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId!);

      if (error) throw error;
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, userId] });
      const previous = queryClient.getQueryData<InAppNotification[]>([QUERY_KEY, userId]);

      queryClient.setQueryData<InAppNotification[]>([QUERY_KEY, userId], (old) =>
        old?.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      const wasUnread = previous?.find((n) => n.id === notificationId && !n.read);
      if (wasUnread) decrement();

      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData([QUERY_KEY, userId], ctx.previous);
      }
    },
  });
}

export function useMarkAllAsRead() {
  const userId = useAuthStore((s) => s.profile?.id);
  const reset = useNotificationsStore((s) => s.reset);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!isSupabaseConfigured) return;

      const { error } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('user_id', userId!)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData<InAppNotification[]>([QUERY_KEY, userId], (old) =>
        old?.map((n) => ({ ...n, read: true }))
      );
      reset();
    },
  });
}
