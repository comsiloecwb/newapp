import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { Church, Profile } from '@/types/database';

async function loadSession(): Promise<{ profile: Profile; church: Church } | null> {
  if (!isSupabaseConfigured) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  console.log('[session] supabase session:', sessionData.session?.user?.id ?? 'null');
  if (!sessionData.session) return null;

  const userId = sessionData.session.user.id;

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  console.log('[session] users query:', profile?.id ?? 'null', profileError?.message ?? 'ok');

  if (profileError || !profile) return null;

  const { data: church, error: churchError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', profile.tenant_id)
    .single();
  console.log('[session] tenants query:', church?.id ?? 'null', churchError?.message ?? 'ok');

  if (churchError || !church) return null;

  return { profile: profile as Profile, church: church as Church };
}

export function useSession() {
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);
  const storeProfile = useAuthStore((s) => s.profile);
  const storeChurch = useAuthStore((s) => s.church);

  const query = useQuery({
    queryKey: ['session'],
    queryFn: loadSession,
    enabled: isSupabaseConfigured,
  });

  useEffect(() => {
    if (query.data) {
      setSession(query.data.profile, query.data.church);
    } else if (!query.isLoading && !query.data && !storeProfile) {
      clear();
    }
  }, [query.data, query.isLoading, setSession, clear, storeProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void query.refetch();
    });

    return () => sub.subscription.unsubscribe();
  }, [query]);

  // Retorna session do store (inclui mock) ou do query
  const session = storeProfile && storeChurch
    ? { profile: storeProfile, church: storeChurch }
    : query.data ?? null;

  return {
    session,
    isLoading: query.isLoading,
    isConfigured: isSupabaseConfigured,
    refetch: query.refetch,
  };
}