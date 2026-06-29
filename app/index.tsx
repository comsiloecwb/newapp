import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useSession } from '@/features/auth/hooks/use-session';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

export default function Index() {
  const { session, isLoading } = useSession();
  const profile = useAuthStore((s) => s.profile);

  if (!isSupabaseConfigured && profile) {
    return <Redirect href="/(tabs)" />;
  }

  if (isSupabaseConfigured && isLoading) {
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
