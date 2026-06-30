import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';

import { EmptyState } from '@/components/ui/EmptyState';
import { EventListItem } from '@/features/events/components/EventListItem';
import { useUpcomingEvents } from '@/features/events/hooks/use-events';
import { WeeklyMessageCard } from '@/features/home/components/WeeklyMessageCard';
import { isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_EVENTS } from '@/lib/mock-data';
import { useAuthStore } from '@/stores/auth-store';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

const SERIF_REGULAR = 'PlayfairDisplay_400Regular';
const SERIF_MEDIUM = 'PlayfairDisplay_500Medium';

export default function HomeScreen() {
  const theme = useChurchTheme();
  const profile = useAuthStore((s) => s.profile);
  const church = useAuthStore((s) => s.church);
  const { data: events, isLoading } = useUpcomingEvents(5);

  const list = (events?.length ? events : MOCK_EVENTS);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greetingBlock}>
          <Text style={[styles.greetingLabel, { color: theme.textMuted }]}>{greeting}</Text>
          <Text style={[styles.greetingName, { color: theme.text, fontFamily: SERIF_REGULAR }]}>
            {profile?.name ?? church?.name ?? 'App Igreja'}
          </Text>
        </View>

        {/* Palavra da Semana */}
        <WeeklyMessageCard />

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.elevated }]} />

        {/* Upcoming Events */}
        <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: SERIF_MEDIUM }]}>
          Upcoming
        </Text>

        {isLoading && isSupabaseConfigured ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />
        ) : list?.length ? (
          <View style={[styles.listCard, { backgroundColor: theme.surface }]}>
            {list.map((event) => (
              <EventListItem key={event.id} event={event} />
            ))}
          </View>
        ) : (
          <EmptyState
            title="Nenhum evento próximo"
            message="Novos eventos aparecerão aqui"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 48, gap: 20 },
  greetingBlock: { gap: 4 },
  greetingLabel: { fontSize: 13, letterSpacing: 0.4 },
  greetingName: { fontSize: 34, lineHeight: 40 },
  divider: { height: 1, marginHorizontal: -20 },
  sectionTitle: { fontSize: 32, lineHeight: 38 },
  listCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
});
