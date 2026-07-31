import { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Clock, MapPin, Phone, Users } from 'lucide-react-native';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import {
  useCelulas,
  useMinhaMembresia,
  useSolicitarEntrada,
  useSairDaCelula,
} from '@/features/celulas/hooks/use-celulas';
import type { Celula, MembroCelula } from '@/types/database';

const DARK_BG = '#0A1628';
const SERIF = 'PlayfairDisplay_500Medium';

const DIAS: Record<string, string> = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

function StatusBadge({ status }: { status: MembroCelula['status'] }) {
  const label = status === 'aprovado' ? 'Membro' : 'Pendente';
  const color = status === 'aprovado' ? '#22c55e' : '#f59e0b';
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '60' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function CelulaCard({
  celula,
  membro,
  onSolicitar,
  onSair,
  theme,
}: {
  celula: Celula;
  membro: MembroCelula | undefined;
  onSolicitar: () => void;
  onSair: () => void;
  theme: ReturnType<typeof useChurchTheme>;
}) {
  const diaLabel = celula.dia_semana ? (DIAS[celula.dia_semana] ?? celula.dia_semana) : null;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardNome, { color: theme.text, fontFamily: SERIF }]}>{celula.nome}</Text>
        {membro && <StatusBadge status={membro.status} />}
      </View>

      <View style={styles.infos}>
        {(celula.bairro || celula.endereco_completo) && (
          <View style={styles.infoRow}>
            <MapPin size={13} color={theme.textMuted} strokeWidth={1.6} />
            <Text style={[styles.infoText, { color: theme.textMuted }]}>
              {celula.endereco_completo ?? celula.bairro}
            </Text>
          </View>
        )}
        {(diaLabel || celula.horario) && (
          <View style={styles.infoRow}>
            <Clock size={13} color={theme.textMuted} strokeWidth={1.6} />
            <Text style={[styles.infoText, { color: theme.textMuted }]}>
              {[diaLabel, celula.horario].filter(Boolean).join(' · ')}
            </Text>
          </View>
        )}
        {celula.contato_telefone && (
          <View style={styles.infoRow}>
            <Phone size={13} color={theme.textMuted} strokeWidth={1.6} />
            <Text style={[styles.infoText, { color: theme.textMuted }]}>{celula.contato_telefone}</Text>
          </View>
        )}
      </View>

      {!membro ? (
        <Pressable style={[styles.joinBtn, { backgroundColor: theme.accent }]} onPress={onSolicitar}>
          <Text style={styles.joinBtnText}>Solicitar participação</Text>
        </Pressable>
      ) : (
        <Pressable style={[styles.leaveBtn, { borderColor: theme.elevated }]} onPress={onSair}>
          <Text style={[styles.leaveBtnText, { color: theme.textMuted }]}>
            {membro.status === 'pendente' ? 'Cancelar solicitação' : 'Sair da célula'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export default function CelulasScreen() {
  const theme = useChurchTheme();
  const { data: celulas, isLoading } = useCelulas();
  const { data: membros } = useMinhaMembresia();
  const { mutate: solicitar } = useSolicitarEntrada();
  const { mutate: sair } = useSairDaCelula();

  const membroMap = useMemo(() => {
    const map: Record<string, MembroCelula> = {};
    (membros ?? []).forEach((m) => { map[m.celula_id] = m; });
    return map;
  }, [membros]);

  function handleSolicitar(celula: Celula) {
    Alert.alert('Solicitar participação', `Deseja solicitar entrada na célula "${celula.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Solicitar',
        onPress: () => solicitar(celula.id, { onError: (e: any) => Alert.alert('Erro', e?.message) }),
      },
    ]);
  }

  function handleSair(celula: Celula) {
    const membro = membroMap[celula.id];
    if (!membro) return;
    const isPendente = membro.status === 'pendente';
    Alert.alert(
      isPendente ? 'Cancelar solicitação' : 'Sair da célula',
      isPendente ? 'Cancelar sua solicitação de entrada?' : `Deseja sair da célula "${celula.nome}"?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: isPendente ? 'Cancelar' : 'Sair',
          style: 'destructive',
          onPress: () => sair(membro.id, { onError: (e: any) => Alert.alert('Erro', e?.message) }),
        },
      ]
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Células',
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 17 },
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <FlatList
          data={celulas ?? []}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={[styles.sub, { color: theme.textMuted }]}>
                Pequenos grupos que se reúnem semanalmente.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <CelulaCard
              celula={item}
              membro={membroMap[item.id]}
              onSolicitar={() => handleSolicitar(item)}
              onSair={() => handleSair(item)}
              theme={theme}
            />
          )}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.empty}>
                <Users size={48} color={theme.textMuted} strokeWidth={1} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Nenhuma célula cadastrada</Text>
                <Text style={[styles.emptyMsg, { color: theme.textMuted }]}>
                  As células serão listadas aqui quando disponíveis.
                </Text>
              </View>
            )
          }
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  header: { marginBottom: 4 },
  sub: { fontSize: 13, lineHeight: 19 },

  card: {
    borderRadius: 14, padding: 16, gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardNome: { fontSize: 16, flex: 1 },

  badge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  infos: { gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13, flex: 1 },

  joinBtn: { borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  joinBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  leaveBtn: { borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1 },
  leaveBtnText: { fontSize: 13, fontWeight: '500' },

  empty: { alignItems: 'center', paddingTop: 48, gap: 10, paddingHorizontal: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginTop: 4 },
  emptyMsg: { textAlign: 'center', fontSize: 13, lineHeight: 19 },
});
