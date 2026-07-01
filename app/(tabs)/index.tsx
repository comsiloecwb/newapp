import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Heart } from 'lucide-react-native';

import { useLatestWeeklyMessage } from '@/features/weekly-message/hooks/use-weekly-message';
import { useAuthStore } from '@/stores/auth-store';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useNotificationsStore } from '@/stores/notifications-store';
import { useNotificationsSheetStore } from '@/stores/notifications-sheet-store';

const GOLD = '#C9A84C';
const DARK_BG = '#0A1628';
const SERIF = 'PlayfairDisplay_400Regular';

type Prayer = {
  id: string;
  title: string;
  name: string;
  time: string;
  likes: number;
  liked: boolean;
};

const INITIAL_PRAYERS: Prayer[] = [
  { id: 'p1', title: 'Oração pela saúde da minha mãe', name: 'Ana Clara M.', time: 'há 2 horas', likes: 14, liked: false },
  { id: 'p2', title: 'Sabedoria para decisão profissional', name: 'João Santos', time: 'há 5 horas', likes: 7, liked: false },
  { id: 'p3', title: 'Restauração do meu casamento', name: 'Pedro Lima', time: 'há 1 dia', likes: 23, liked: true },
];

export default function HomeScreen() {
  const theme = useChurchTheme();
  const profile = useAuthStore((s) => s.profile);
  const church = useAuthStore((s) => s.church);
  const { data: message, isLoading: messageLoading } = useLatestWeeklyMessage();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const openNotifications = useNotificationsSheetStore((s) => s.open);
  const insets = useSafeAreaInsets();

  const [prayers, setPrayers] = useState<Prayer[]>(INITIAL_PRAYERS);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const firstName = useMemo(() => {
    const name = profile?.name ?? '';
    return name.split(' ')[0] || church?.name || 'Bem-vindo';
  }, [profile?.name, church?.name]);

  const toggleLike = useCallback((id: string) => {
    setPrayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Dark header + Palavra do Dia */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>

          {/* Top row: church name + bell */}
          <View style={styles.headerTop}>
            <Text style={styles.churchName}>
              {(church?.name ?? 'Igreja Siloé').toUpperCase()}
            </Text>
            <Pressable onPress={openNotifications} style={styles.bellWrap} hitSlop={8}>
              <Bell size={20} color="rgba(255,255,255,0.75)" strokeWidth={1.6} />
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Greeting */}
          <Text style={[styles.greeting, { fontFamily: SERIF }]}>
            {greeting}, {firstName} ✦
          </Text>

          {/* Palavra do Dia */}
          <View style={styles.palavraWrap}>
            <Text style={styles.palavraLabel}>📖  PALAVRA DO DIA</Text>
            {messageLoading ? (
              <ActivityIndicator color={GOLD} style={{ marginTop: 16 }} />
            ) : message ? (
              <>
                <Text style={[styles.verse, { fontFamily: SERIF }]}>{message.title}</Text>
                <View style={styles.goldLine} />
                <Text style={styles.reflection} numberOfLines={4}>{message.content}</Text>
              </>
            ) : (
              <Text style={[styles.verse, { fontFamily: SERIF }]}>
                "Porque eu sei os planos que tenho para vocês..."
              </Text>
            )}
          </View>
        </View>

        {/* White content section */}
        <View style={[styles.content, { backgroundColor: theme.background }]}>

          {/* Prayer wall header */}
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Mural de Oração</Text>
            <Pressable style={styles.addBtn}>
              <Text style={styles.addBtnText}>＋ Pedir Oração</Text>
            </Pressable>
          </View>

          {/* Prayer cards */}
          {prayers.map((prayer) => (
            <PrayerCard key={prayer.id} prayer={prayer} onToggle={toggleLike} theme={theme} />
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

function PrayerCard({
  prayer,
  onToggle,
  theme,
}: {
  prayer: Prayer;
  onToggle: (id: string) => void;
  theme: ReturnType<typeof useChurchTheme>;
}) {
  return (
    <View style={[styles.prayerCard, { backgroundColor: theme.surface }]}>
      <View style={styles.prayerBody}>
        <Text style={[styles.prayerTitle, { color: theme.text }]}>{prayer.title}</Text>
        <View style={styles.prayerMeta}>
          <Text style={[styles.prayerName, { color: theme.textMuted }]}>{prayer.name}</Text>
          <Text style={[styles.prayerTime, { color: theme.textMuted }]}>· {prayer.time}</Text>
        </View>
      </View>
      <Pressable onPress={() => onToggle(prayer.id)} style={styles.likeBtn} hitSlop={8}>
        <Heart
          size={17}
          color={prayer.liked ? GOLD : theme.textMuted}
          fill={prayer.liked ? GOLD : 'transparent'}
          strokeWidth={1.6}
        />
        <Text style={[styles.likeCount, { color: prayer.liked ? GOLD : theme.textMuted }]}>
          {prayer.likes}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // Dark header
  header: {
    backgroundColor: DARK_BG,
    paddingHorizontal: 22,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  churchName: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
  },
  bellWrap: { padding: 4 },
  bellBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  bellBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  greeting: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '300',
    letterSpacing: 0.2,
    marginBottom: 22,
  },

  // Palavra do Dia
  palavraWrap: { gap: 10 },
  palavraLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  verse: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 30,
  },
  goldLine: {
    height: 1,
    width: 36,
    backgroundColor: GOLD,
  },
  reflection: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 20,
  },

  // Content section
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  addBtn: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  addBtnText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '600',
  },

  // Prayer card
  prayerCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  prayerBody: { flex: 1, gap: 5 },
  prayerTitle: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  prayerMeta: { flexDirection: 'row', alignItems: 'center' },
  prayerName: { fontSize: 12 },
  prayerTime: { fontSize: 12 },
  likeBtn: { alignItems: 'center', gap: 3 },
  likeCount: { fontSize: 11, fontWeight: '600' },
});
