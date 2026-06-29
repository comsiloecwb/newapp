import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { EventListItem } from '@/features/events/components/EventListItem';
import { useUpcomingEvents } from '@/features/events/hooks/use-events';
import { WeeklyMessageCard } from '@/features/home/components/WeeklyMessageCard';
import { isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_EVENTS } from '@/lib/mock-data';
import { useAuthStore } from '@/stores/auth-store';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

export default function HomeScreen() {
  const theme = useChurchTheme();
  const church = useAuthStore((s) => s.church);
  const { data: events, isLoading } = useUpcomingEvents(5);

  const list = isSupabaseConfigured ? events : MOCK_EVENTS;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.greeting, { color: theme.text }]}>
          {church?.name ?? 'App Igreja'}
        </Text>

        <WeeklyMessageCard />

        <Text style={[styles.section, { color: theme.text }]}>Próximos eventos</Text>
        {isLoading && isSupabaseConfigured ? (
          <ActivityIndicator color={theme.primary} />
        ) : list?.length ? (
          list.map((event) => <EventListItem key={event.id} event={event} />)
        ) : (
          <EmptyState title="Nenhum evento próximo" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 12 },
  greeting: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  section: { fontSize: 18, fontWeight: '700', marginTop: 8 },
});
