import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

// Deep link fallback: appigreja://auth/callback#access_token=...
// Handles the case where the OS opens the app from a browser redirect.
export default function AuthCallback() {
  const setSession = useAuthStore((s) => s.setSession);
  const params = useLocalSearchParams<{ access_token?: string; refresh_token?: string }>();

  useEffect(() => {
    async function finish() {
      const accessToken = params.access_token;
      const refreshToken = params.refresh_token;
      if (!accessToken || !refreshToken) {
        router.replace('/(auth)/login');
        return;
      }

      const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (error || !data.session) { router.replace('/(auth)/login'); return; }

      const userId = data.session.user.id;
      const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
      if (!user) { router.replace('/(auth)/login'); return; }

      const { data: tenant } = await supabase.from('tenants').select('*').eq('id', user.tenant_id).single();
      if (!tenant) { router.replace('/(auth)/login'); return; }

      setSession(user, tenant);
      router.replace('/(tabs)');
    }
    void finish();
  }, [params.access_token, params.refresh_token, setSession]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
