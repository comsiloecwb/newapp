import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { Registration } from '@/types/database';

export function useMyRegistration(eventId: string | undefined) {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ['registration', eventId, userId],
    enabled: Boolean(eventId && userId && isSupabaseConfigured),
    queryFn: async (): Promise<Registration | null> => {
      const { data, error } = await supabase
        .from('inscricoes')
        .select('*')
        .eq('evento_id', eventId!)
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data as Registration | null;
    },
  });
}

export function useRsvp() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (eventId: string): Promise<Registration> => {
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('inscricoes')
        .insert({
          evento_id: eventId,
          user_id: user.id,
          tenant_id: user.tenant_id,
          status: 'pendente',
        })
        .select()
        .single();
      if (error) throw error;
      return data as Registration;
    },
    onSuccess: (_, eventId) => {
      qc.invalidateQueries({ queryKey: ['registration', eventId] });
    },
    onError: (err: Error) => {
      Alert.alert('Erro', err.message);
    },
  });
}

export function useCancelRsvp() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async ({ registrationId, eventId }: { registrationId: string; eventId: string }) => {
      const { error } = await supabase
        .from('inscricoes')
        .update({ status: 'cancelado' })
        .eq('id', registrationId)
        .eq('user_id', userId!);
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      qc.invalidateQueries({ queryKey: ['registration', eventId] });
    },
    onError: (err: Error) => {
      Alert.alert('Erro', err.message);
    },
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async ({ registrationId, eventId }: { registrationId: string; eventId: string }) => {
      const { error } = await supabase
        .from('inscricoes')
        .update({ checked_in_at: new Date().toISOString() })
        .eq('id', registrationId)
        .eq('user_id', userId!);
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      qc.invalidateQueries({ queryKey: ['registration', eventId] });
    },
    onError: (err: Error) => {
      Alert.alert('Erro', err.message);
    },
  });
}

export interface StripeCheckoutResult {
  url: string;
  inscricaoId: string;
}

export function useStripeCheckout() {
  const profile = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, successUrl, cancelUrl }: {
      eventId: string;
      successUrl?: string;
      cancelUrl?: string;
    }): Promise<StripeCheckoutResult> => {
      if (!profile) throw new Error('Não autenticado');
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { event_id: eventId, success_url: successUrl, cancel_url: cancelUrl },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return { url: data.url as string, inscricaoId: data.inscricaoId as string };
    },
    onSuccess: (_, { eventId }) => {
      qc.invalidateQueries({ queryKey: ['registration', eventId] });
    },
  });
}
