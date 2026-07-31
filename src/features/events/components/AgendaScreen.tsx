import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useEventos, type EventoAgenda } from '@/features/events/hooks/use-eventos';
import { EventoCard, EVENTO_CARD_ROW_HEIGHT, REDE_LABELS } from '@/features/events/components/EventoCard';
import type { RedeType } from '@/types/database';

const SERIF_MEDIUM = 'PlayfairDisplay_500Medium';

const REDES = Object.keys(REDE_LABELS) as RedeType[];

function getItemLayout(_: ArrayLike<EventoAgenda> | null | undefined, index: number) {
  return { length: EVENTO_CARD_ROW_HEIGHT, offset: EVENTO_CARD_ROW_HEIGHT * index, index };
}

function keyExtractor(item: EventoAgenda) {
  return item.id;
}

export function AgendaScreen() {
  const theme = useChurchTheme();
  const [rede, setRede] = useState<RedeType>('todos');
  const { data: proximos, isLoading: loadingProximos } = useEventos(rede, 'proximos');
  const { data: passados, isLoading: loadingPassados } = useEventos(rede, 'passados');

  const renderItem = useCallback(
    ({ item }: { item: EventoAgenda }) => <EventoCard evento={item} />,
    [],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Text style={[styles.pageTitle, { color: theme.text, fontFamily: SERIF_MEDIUM }]}>Agenda</Text>

      <View style={styles.tabsWrap}>
        <FlatList
          horizontal
          data={REDES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
          renderItem={({ item }) => {
            const selected = item === rede;
            return (
              <Pressable
                onPress={() => setRede(item)}
                style={[styles.tab, { backgroundColor: selected ? theme.text : theme.surface }]}
              >
                <Text style={[styles.tabLabel, { color: selected ? theme.background : theme.textMuted }]}>
                  {REDE_LABELS[item]}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={proximos ?? []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        windowSize={7}
        removeClippedSubviews
        ListHeaderComponent={
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>PRÓXIMOS EVENTOS</Text>
        }
        ListEmptyComponent={
          loadingProximos ? (
            <ActivityIndicator color={theme.accent} style={{ marginTop: 24 }} />
          ) : (
            <EmptyState title="Nenhum evento nesta rede" message="Novos eventos aparecerão aqui." />
          )
        }
        ListFooterComponent={
          <View style={styles.passadosSection}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>EVENTOS PASSADOS</Text>
            {loadingPassados ? (
              <ActivityIndicator color={theme.accent} style={{ marginTop: 8 }} />
            ) : !passados || passados.length === 0 ? (
              <EmptyState title="Nenhum evento passado" />
            ) : (
              passados.map((evento) => <EventoCard key={evento.id} evento={evento} />)
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pageTitle: { fontSize: 32, lineHeight: 38, paddingHorizontal: 20, paddingTop: 8 },
  tabsWrap: { marginTop: 16, marginBottom: 4 },
  tabsRow: { paddingHorizontal: 20, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20 },
  tabLabel: { fontSize: 13, fontWeight: '500' },
  list: { padding: 20, paddingTop: 12, paddingBottom: 48 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  passadosSection: { marginTop: 24 },
});
