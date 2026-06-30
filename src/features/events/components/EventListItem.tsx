import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import type { Event } from '@/types/database';

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit' });
}

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function EventListItem({ event }: { event: Event }) {
  const theme = useChurchTheme();

  return (
    <Link href={`/event/${event.id}`} asChild>
      <Pressable style={StyleSheet.flatten([styles.row, { borderBottomColor: theme.textMuted + '20' }])}>
        {/* Date block */}
        <View style={[styles.dateBlock, { backgroundColor: theme.cream }]}>
          <Text style={styles.day}>{formatDay(event.start_at)}</Text>
          <Text style={styles.month}>{formatMonth(event.start_at)}</Text>
        </View>

        {/* Content */}
        <View style={styles.body}>
          <Text style={[styles.title, { color: theme.text, fontFamily: 'PlayfairDisplay_400Regular' }]} numberOfLines={2}>
            {event.title}
          </Text>
          <Text style={[styles.meta, { color: theme.textMuted }]}>
            {formatTime(event.start_at)}
            {event.location ? ` · ${event.location}` : ''}
          </Text>
        </View>

        {event.is_paid && (
          <View style={[styles.badge, { backgroundColor: theme.accent + '18' }]}>
            <Text style={[styles.badgeText, { color: theme.accent }]}>Pago</Text>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dateBlock: {
    width: 52,
    height: 60,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  day: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1917',
    lineHeight: 26,
  },
  month: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1C1917',
    letterSpacing: 0.8,
  },
  body: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  meta: { fontSize: 12, lineHeight: 16 },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
