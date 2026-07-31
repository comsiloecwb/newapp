import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Users } from 'lucide-react-native';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useGrupo, useGrupoMembros } from '@/features/grupos/hooks/use-grupos';

const SERIF = 'PlayfairDisplay_500Medium';

function getInitials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function GrupoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useChurchTheme();

  const { data: grupo, isLoading: loadingGrupo } = useGrupo(id);
  const { data: membros, isLoading: loadingMembros } = useGrupoMembros(id);

  if (loadingGrupo) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: grupo?.nome ?? 'Grupo' }} />
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.nome, { color: theme.text, fontFamily: SERIF }]}>
            {grupo?.nome ?? 'Grupo'}
          </Text>

          <View style={styles.membersHeader}>
            <Users size={15} color={theme.textMuted} strokeWidth={1.6} />
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
              MEMBROS · {membros?.length ?? 0}
            </Text>
          </View>

          {loadingMembros ? (
            <ActivityIndicator color={theme.accent} style={{ marginTop: 16 }} />
          ) : (
            <View style={styles.list}>
              {(membros ?? []).map((membro) => (
                <View key={membro.id} style={[styles.memberRow, { backgroundColor: theme.surface }]}>
                  <View style={[styles.avatar, { backgroundColor: theme.elevated }]}>
                    <Text style={[styles.avatarInitial, { color: theme.text }]}>
                      {getInitials(membro.nome)}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.memberNome, { color: theme.text }]}>{membro.nome}</Text>
                    <Text style={[styles.memberEmail, { color: theme.textMuted }]}>{membro.email}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 40, gap: 8 },
  nome: { fontSize: 22, marginBottom: 8 },
  membersHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  list: { gap: 8, marginTop: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 13, fontWeight: '700' },
  memberNome: { fontSize: 14, fontWeight: '500' },
  memberEmail: { fontSize: 12 },
});
