import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { useEvents } from '@/features/events/hooks/use-events';
import { isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_EVENTS } from '@/lib/mock-data';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useChurchTheme();
  const { data } = useEvents('upcoming');
  const all = isSupabaseConfigured ? data : MOCK_EVENTS;
  const event = all?.find((e) => e.id === id);

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.text }}>Evento não encontrado</Text>
      </View>
    );
  }

  const price =
    event.is_paid && event.price_cents != null
      ? `R$ ${(event.price_cents / 100).toFixed(2)}`
      : 'Gratuito (RSVP)';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>
      <Text style={{ color: theme.textMuted }}>{event.description}</Text>
      <Text style={[styles.meta, { color: theme.secondary }]}>{price}</Text>
      <Text style={{ color: theme.textMuted, marginTop: 16 }}>
        Stripe Checkout e RSVP serão ligados na próxima sprint.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  meta: { fontSize: 18, fontWeight: '700', marginTop: 16 },
});
