import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { MembershipRequest } from '@/types/database';

export type MembershipRequestStatus = 'member' | 'none' | 'pendente' | 'negado';

export function useMembershipRequest() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const query = useQuery({
    queryKey: ['membership-request', user?.id],
    enabled: Boolean(user?.id) && isSupabaseConfigured,
    queryFn: async (): Promise<MembershipRequest | null> => {
      const { data, error } = await supabase
        .from('membership_requests')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as MembershipRequest | null;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase.from('membership_requests').insert({
        user_id: user.id,
        tenant_id: user.tenant_id,
        status: 'pendente',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['membership-request', user?.id] });
    },
    onError: (err: Error) => {
      Alert.alert('Erro', err.message);
    },
  });

  const requestStatus = query.data?.status;
  const status: MembershipRequestStatus =
    user?.role === 'member' || requestStatus === 'aprovado'
      ? 'member'
      : (requestStatus ?? 'none');

  return {
    status,
    request: query.data ?? null,
    isLoading: query.isLoading,
    requestMembership: mutation.mutate,
    isRequesting: mutation.isPending,
  };
}
