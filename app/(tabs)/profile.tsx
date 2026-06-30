import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LogOut, Mail, Shield } from 'lucide-react-native';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

const SERIF_MEDIUM = 'PlayfairDisplay_500Medium';

function getInitials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function ProfileScreen() {
  const theme = useChurchTheme();
  const profile = useAuthStore((s) => s.profile);
  const church = useAuthStore((s) => s.church);
  const clear = useAuthStore((s) => s.clear);

  async function handleLogout() {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    clear();
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Avatar hero */}
        <View style={[styles.heroCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.avatarRing, { borderColor: theme.accent }]}>
            <Text style={[styles.initials, { color: theme.text }]}>{getInitials(profile?.name)}</Text>
          </View>
          <Text style={[styles.name, { color: theme.text, fontFamily: SERIF_MEDIUM }]}>
            {profile?.name ?? 'Usuário'}
          </Text>
          <View style={[styles.rolePill, { backgroundColor: theme.elevated }]}>
            <Text style={[styles.roleText, { color: theme.textMuted }]}>
              {(profile?.role ?? 'membro').toUpperCase()}
            </Text>
          </View>
          {church?.name ? (
            <Text style={[styles.churchName, { color: theme.textMuted }]}>{church.name}</Text>
          ) : null}
        </View>

        {/* Info rows */}
        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: theme.elevated }]}>
              <Mail size={16} color={theme.textMuted} strokeWidth={1.8} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>E-mail</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{profile?.email ?? '—'}</Text>
            </View>
          </View>

          <View style={[styles.separator, { backgroundColor: theme.elevated }]} />

          <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: theme.elevated }]}>
              <Shield size={16} color={theme.textMuted} strokeWidth={1.8} />
            </View>
            <View style={styles.infoTexts}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Papel</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{profile?.role ?? '—'}</Text>
            </View>
          </View>

          <View style={[styles.separator, { backgroundColor: theme.elevated }]} />

          <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: theme.elevated }]}>
              <Text style={{ fontSize: 15, color: theme.textMuted }}>✦</Text>
            </View>
            <View style={styles.infoTexts}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Igreja</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{church?.name ?? '—'}</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <Pressable
          style={[styles.logoutBtn, { borderColor: theme.elevated }]}
          onPress={handleLogout}
        >
          <LogOut size={16} color="#DC2626" strokeWidth={1.8} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  heroCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  initials: { fontSize: 28, fontWeight: '600' },
  name: { fontSize: 22, lineHeight: 28 },
  rolePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleText: { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  churchName: { fontSize: 13 },
  infoCard: {
    borderRadius: 16,
    paddingHorizontal: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 15,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTexts: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: 15 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 48 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    marginTop: 4,
  },
  logoutText: { color: '#DC2626', fontSize: 14, fontWeight: '500' },
});
