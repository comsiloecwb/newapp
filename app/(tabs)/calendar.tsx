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

type Filter = 'upcoming' | 'past';

export default function CalendarScreen() {
  const theme = useChurchTheme();
  const [filter, setFilter] = useState<Filter>('upcoming');
  const { data, isLoading } = useEvents(filter);

  const list = isSupabaseConfigured ? data : MOCK_EVENTS;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <View style={styles.filters}>
        {(['upcoming', 'past'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.chip,
              {
                backgroundColor: filter === f ? theme.primary : theme.surface,
              },
            ]}
          >
            <Text style={{ color: filter === f ? '#fff' : theme.text }}>
              {f === 'upcoming' ? 'Próximos' : 'Passados'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {isLoading && isSupabaseConfigured ? (
          <ActivityIndicator color={theme.primary} />
        ) : list?.length ? (
          list.map((event) => <EventListItem key={event.id} event={event} />)
        ) : (
          <EmptyState title="Nenhum evento neste filtro" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  filters: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 0 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  list: { padding: 16 },
});
