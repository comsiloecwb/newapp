import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import type { Event } from '@/types/database';

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EventListItem({ event }: { event: Event }) {
  const theme = useChurchTheme();

  return (
    <Link href={`/event/${event.id}`} asChild>
      <Pressable style={[styles.row, { backgroundColor: theme.surface }]}>
        <View style={styles.body}>
          <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>
          <Text style={[styles.meta, { color: theme.textMuted }]}>
            {formatEventDate(event.start_at)}
          </Text>
          {event.location ? (
            <Text style={[styles.meta, { color: theme.textMuted }]}>{event.location}</Text>
          ) : null}
        </View>
        {event.is_paid ? (
          <Text style={[styles.badge, { backgroundColor: theme.secondary }]}>Pago</Text>
        ) : (
          <Text style={[styles.badge, { backgroundColor: theme.primary }]}>RSVP</Text>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  body: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 13, marginTop: 4 },
  badge: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
