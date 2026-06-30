import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, Users } from 'lucide-react-native';

import { useEventById } from '@/features/events/hooks/use-events';
import {
  useMyRegistration,
  useRsvp,
  useCancelRsvp,
  useStripeCheckout,
} from '@/features/events/hooks/use-registration';
import { isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_EVENTS } from '@/lib/mock-data';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

const SERIF = 'PlayfairDisplay_500Medium';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatPrice(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useChurchTheme();

  const { data: supabaseEvent, isLoading } = useEventById(id);
  const { data: registration } = useMyRegistration(id);
  const { mutate: rsvp, isPending: rsvping } = useRsvp();
  const { mutate: cancel, isPending: cancelling } = useCancelRsvp();
  const { mutate: checkout, isPending: checkingOut } = useStripeCheckout();

  const mockEvent = MOCK_EVENTS.find((e) => e.id === id);
  const event = isSupabaseConfigured ? (supabaseEvent ?? null) : (mockEvent ?? null);

  if (isLoading && isSupabaseConfigured) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.notFound, { color: theme.text, fontFamily: SERIF }]}>
          Evento não encontrado
        </Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={[styles.backLinkText, { color: theme.accent }]}>← Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const isRegistered = registration?.status === 'confirmed';

  function handleCta() {
    if (!event) return;
    if (event.is_paid) {
      checkout(
        { eventId: event.id, successUrl: 'appigreja://payment-success', cancelUrl: 'appigreja://payment-cancel' },
        {
          onSuccess: (url) => Linking.openURL(url),
        },
      );
    } else {
      rsvp(event.id);
    }
  }

  function handleCancel() {
    if (!registration) return;
    cancel({ registrationId: registration.id, eventId: event!.id });
  }

  const ctaLoading = rsvping || checkingOut;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Date chip */}
        <View style={[styles.dateChip, { backgroundColor: theme.cream }]}>
          <Text style={[styles.dateChipDay, { color: theme.text }]}>
            {new Date(event.start_at).toLocaleDateString('pt-BR', { day: '2-digit' })}
          </Text>
          <Text style={[styles.dateChipMonth, { color: theme.text }]}>
            {new Date(event.start_at).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.text, fontFamily: SERIF }]}>{event.title}</Text>

        {/* Meta rows */}
        <View style={[styles.metaCard, { backgroundColor: theme.surface }]}>
          <View style={styles.metaRow}>
            <Calendar size={16} color={theme.accent} strokeWidth={1.8} />
            <Text style={[styles.metaText, { color: theme.text }]}>{formatDate(event.start_at)}</Text>
          </View>
          <View style={[styles.metaDivider, { backgroundColor: theme.elevated }]} />
          <View style={styles.metaRow}>
            <Clock size={16} color={theme.accent} strokeWidth={1.8} />
            <Text style={[styles.metaText, { color: theme.text }]}>
              {formatTime(event.start_at)}
              {event.end_at ? ` – ${formatTime(event.end_at)}` : ''}
            </Text>
          </View>
          {event.location ? (
            <>
              <View style={[styles.metaDivider, { backgroundColor: theme.elevated }]} />
              <View style={styles.metaRow}>
                <MapPin size={16} color={theme.accent} strokeWidth={1.8} />
                <Text style={[styles.metaText, { color: theme.text }]}>{event.location}</Text>
              </View>
            </>
          ) : null}
          {event.capacity ? (
            <>
              <View style={[styles.metaDivider, { backgroundColor: theme.elevated }]} />
              <View style={styles.metaRow}>
                <Users size={16} color={theme.accent} strokeWidth={1.8} />
                <Text style={[styles.metaText, { color: theme.text }]}>
                  Capacidade: {event.capacity} pessoas
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Description */}
        {event.description ? (
          <View style={styles.descBlock}>
            <Text style={[styles.descLabel, { color: theme.textMuted }]}>SOBRE O EVENTO</Text>
            <Text style={[styles.desc, { color: theme.text }]}>{event.description}</Text>
          </View>
        ) : null}

        {/* Price */}
        {event.is_paid && event.price_cents ? (
          <View style={[styles.priceRow, { backgroundColor: theme.surface }]}>
            <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Valor</Text>
            <Text style={[styles.price, { color: theme.text, fontFamily: SERIF }]}>
              {formatPrice(event.price_cents)}
            </Text>
          </View>
        ) : null}

        {/* CTA */}
        {isSupabaseConfigured ? (
          isRegistered ? (
            <View style={styles.ctaArea}>
              <View style={[styles.confirmedBadge, { backgroundColor: '#16A34A18' }]}>
                <Text style={styles.confirmedText}>✓  Presença confirmada</Text>
              </View>
              <Pressable
                onPress={handleCancel}
                disabled={cancelling}
                style={styles.cancelLink}
              >
                <Text style={[styles.cancelLinkText, { color: theme.textMuted }]}>
                  {cancelling ? 'Cancelando...' : 'Cancelar inscrição'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[styles.cta, { backgroundColor: theme.text }, ctaLoading && styles.ctaDisabled]}
              onPress={handleCta}
              disabled={ctaLoading}
            >
              <Text style={[styles.ctaText, { color: theme.background }]}>
                {ctaLoading
                  ? 'Aguarde...'
                  : event.is_paid
                  ? `Comprar ingresso · ${formatPrice(event.price_cents!)}`
                  : 'Confirmar presença'}
              </Text>
            </Pressable>
          )
        ) : (
          <View style={[styles.confirmedBadge, { backgroundColor: theme.surface }]}>
            <Text style={[styles.confirmedText, { color: theme.textMuted }]}>
              Modo preview — login necessário para se inscrever
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  content: { padding: 20, paddingBottom: 48, gap: 20 },
  dateChip: {
    alignSelf: 'flex-start',
    width: 60,
    height: 68,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateChipDay: { fontSize: 26, fontWeight: '700', lineHeight: 30 },
  dateChipMonth: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8 },
  title: { fontSize: 32, lineHeight: 38 },
  metaCard: { borderRadius: 16, paddingHorizontal: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  metaText: { fontSize: 14, flex: 1 },
  metaDivider: { height: StyleSheet.hairlineWidth, marginLeft: 28 },
  descBlock: { gap: 8 },
  descLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 2 },
  desc: { fontSize: 15, lineHeight: 24 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  priceLabel: { fontSize: 13 },
  price: { fontSize: 22 },
  ctaArea: { gap: 12 },
  confirmedBadge: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  confirmedText: { color: '#16A34A', fontSize: 14, fontWeight: '600' },
  cancelLink: { alignItems: 'center' },
  cancelLinkText: { fontSize: 13 },
  cta: {
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { fontSize: 15, fontWeight: '600' },
  notFound: { fontSize: 22 },
  backLink: { marginTop: 8 },
  backLinkText: { fontSize: 15 },
});
