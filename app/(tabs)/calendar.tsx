import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { EventListItem } from '@/features/events/components/EventListItem';
import { useEvents } from '@/features/events/hooks/use-events';
import { isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_EVENTS } from '@/lib/mock-data';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

const SERIF_MEDIUM = 'PlayfairDisplay_500Medium';

type Filter = 'upcoming' | 'past';

export default function CalendarScreen() {
  const theme = useChurchTheme();
  const [filter, setFilter] = useState<Filter>('upcoming');
  const { data, isLoading } = useEvents(filter);

  const list = (data?.length ? data : MOCK_EVENTS);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={[styles.pageTitle, { color: theme.text, fontFamily: SERIF_MEDIUM }]}>
          {filter === 'upcoming' ? 'Upcoming' : 'Past Events'}
        </Text>

        {/* Filter pills */}
        <View style={styles.filterRow}>
          {(['upcoming', 'past'] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.pill,
                filter === f
                  ? { backgroundColor: theme.text }
                  : { backgroundColor: theme.surface },
              ]}
            >
              <Text
                style={[
                  styles.pillLabel,
                  { color: filter === f ? theme.background : theme.textMuted },
                ]}
              >
                {f === 'upcoming' ? 'Próximos' : 'Passados'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Event list */}
        {isLoading && isSupabaseConfigured ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
        ) : list?.length ? (
          <View style={[styles.listCard, { backgroundColor: theme.surface }]}>
            {list.map((event) => (
              <EventListItem key={event.id} event={event} />
            ))}
          </View>
        ) : (
          <EmptyState
            title={filter === 'upcoming' ? 'Nenhum evento próximo' : 'Nenhum evento passado'}
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
  pageTitle: { fontSize: 36, lineHeight: 42 },
  filterRow: { flexDirection: 'row', gap: 10 },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 24,
  },
  pillLabel: { fontSize: 13, fontWeight: '500' },
  listCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
});
