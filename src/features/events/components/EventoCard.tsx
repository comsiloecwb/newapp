import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import type { RedeType } from '@/types/database';
import type { EventoAgenda } from '@/features/events/hooks/use-eventos';

export const EVENTO_CARD_HEIGHT = 108;
export const EVENTO_CARD_GAP = 10;
export const EVENTO_CARD_ROW_HEIGHT = EVENTO_CARD_HEIGHT + EVENTO_CARD_GAP;

export const REDE_LABELS: Record<RedeType, string> = {
  todos: 'Todos',
  homens: 'Homens',
  mulheres: 'Mulheres',
  jovem: 'Jovem',
  casais: 'Casais',
  kids: 'Kids',
};

const REDE_COLORS: Record<RedeType, string> = {
  todos: '#6E5E50',
  homens: '#3B82F6',
  mulheres: '#EC4899',
  jovem: '#8B5CF6',
  casais: '#C9954A',
  kids: '#10B981',
};

const CONFIRMADO_GREEN = '#16A34A';

function formatDataHora(iso: string) {
  const d = new Date(iso);
  const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${data} · ${hora}`;
}

export function EventoCard({ evento }: { evento: EventoAgenda }) {
  const theme = useChurchTheme();
  const corRede = REDE_COLORS[evento.rede];
  const lotado = evento.vagasRestantes === 0;
  const passado = new Date(evento.start_at) < new Date();

  return (
    <Link href={`/event/${evento.id}`} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: theme.surface, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.titulo, { color: theme.text }]} numberOfLines={1}>
            {evento.titulo}
          </Text>
          <View style={[styles.badge, { backgroundColor: corRede + '20' }]}>
            <Text style={[styles.badgeText, { color: corRede }]}>{REDE_LABELS[evento.rede]}</Text>
          </View>
        </View>

        <Text style={[styles.meta, { color: theme.textMuted }]} numberOfLines={1}>
          {formatDataHora(evento.start_at)}
          {evento.location ? ` · ${evento.location}` : ''}
        </Text>

        {(evento.confirmado || evento.vagasRestantes != null) && (
          <View style={styles.footer}>
            {evento.confirmado ? (
              <View style={[styles.badge, { backgroundColor: CONFIRMADO_GREEN + '20' }]}>
                <Text style={[styles.badgeText, { color: CONFIRMADO_GREEN }]}>
                  {passado ? '✓ Fui' : '✓ Confirmado'}
                </Text>
              </View>
            ) : (
              <View />
            )}

            {evento.vagasRestantes != null && (
              <Text style={[styles.vagas, { color: lotado ? '#DC2626' : theme.accent }]}>
                {lotado ? 'Lotado' : `${evento.vagasRestantes} vagas restantes`}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    height: EVENTO_CARD_HEIGHT,
    marginBottom: EVENTO_CARD_GAP,
    borderRadius: 14,
    padding: 16,
    justifyContent: 'center',
    gap: 6,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titulo: { flex: 1, fontSize: 15, fontWeight: '600' },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, flexShrink: 0 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  meta: { fontSize: 12.5 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vagas: { fontSize: 12, fontWeight: '600' },
});
