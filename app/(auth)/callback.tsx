import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

const CHURCH_ID = process.env.EXPO_PUBLIC_CHURCH_ID!;

export default function AuthCallback() {
  const setSession = useAuthStore((s) => s.setSession);
  // OAuth Google: tokens no hash → access_token + refresh_token
  // Email confirmation: PKCE → code como query param
  const params = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
    code?: string;
  }>();

  useEffect(() => {
    async function finish() {
      let session = null;

      if (params.code) {
        // Confirmação de email (PKCE flow)
        const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
        if (error || !data.session) { router.replace('/(auth)/login'); return; }
        session = data.session;
      } else if (params.access_token && params.refresh_token) {
        // OAuth Google (implicit flow)
        const { data, error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        if (error || !data.session) { router.replace('/(auth)/login'); return; }
        session = data.session;
      } else {
        router.replace('/(auth)/login');
        return;
      }

      const userId = session.user.id;

      // Tenta carregar perfil existente
      let { data: user } = await supabase.from('users').select('*').eq('id', userId).single();

      // Se não existe (confirmação de email: perfil criado aqui pela primeira vez)
      if (!user) {
        const email = session.user.email ?? '';
        const nome = session.user.user_metadata?.full_name ?? email.split('@')[0];
        const { data: newUser } = await supabase.from('users').insert({
          id: userId,
          tenant_id: CHURCH_ID,
          role: 'visitor',
          is_lider: false,
          nome,
          email,
          notify_new_events: true,
          notify_event_reminders: true,
        }).select().single();
        user = newUser;
      }

      if (!user) { router.replace('/(auth)/login'); return; }

      const { data: tenant } = await supabase.from('tenants').select('*').eq('id', user.tenant_id).single();
      if (!tenant) { router.replace('/(auth)/login'); return; }

      setSession(user, tenant);
      router.replace('/(tabs)');
    }
    void finish();
  }, [params.access_token, params.refresh_token, params.code, setSession]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
