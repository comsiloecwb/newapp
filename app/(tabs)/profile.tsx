import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Card } from '@/components/ui/Card';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

export default function ProfileScreen() {
  const theme = useChurchTheme();
  const profile = useAuthStore((s) => s.profile);
  const church = useAuthStore((s) => s.church);
  const clear = useAuthStore((s) => s.clear);

  async function handleLogout() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    clear();
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={[styles.label, { color: theme.textMuted }]}>Nome</Text>
          <Text style={[styles.value, { color: theme.text }]}>{profile?.name ?? '—'}</Text>
          <Text style={[styles.label, { color: theme.textMuted }]}>E-mail</Text>
          <Text style={[styles.value, { color: theme.text }]}>{profile?.email ?? '—'}</Text>
          <Text style={[styles.label, { color: theme.textMuted }]}>Papel</Text>
          <Text style={[styles.value, { color: theme.text }]}>{profile?.role ?? '—'}</Text>
          <Text style={[styles.label, { color: theme.textMuted }]}>Igreja</Text>
          <Text style={[styles.value, { color: theme.text }]}>{church?.name ?? '—'}</Text>
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Notificações</Text>
          <Text style={{ color: theme.textMuted, fontSize: 14 }}>
            Lembretes 24h e 1h antes dos eventos (configurar push na fase seguinte).
          </Text>
        </Card>

        <Pressable style={[styles.logout, { borderColor: theme.primary }]} onPress={handleLogout}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>Sair</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 12 },
  label: { fontSize: 12, marginTop: 12 },
  value: { fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  logout: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
});
