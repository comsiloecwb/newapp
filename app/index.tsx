import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useSession } from '@/features/auth/hooks/use-session';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { MOCK_CHURCH, MOCK_PROFILE } from '@/lib/mock-data';

export default function Index() {
  const { session, isLoading } = useSession();
  const profile = useAuthStore((s) => s.profile);
  const setSession = useAuthStore((s) => s.setSession);

  if (!isSupabaseConfigured) {
    if (!profile) setSession(MOCK_PROFILE, MOCK_CHURCH);
    return <Redirect href="/(tabs)" />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (session || profile) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
