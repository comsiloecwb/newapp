import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { LogIn, MessageCircle, Plus } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useGrupos } from '@/features/grupos/hooks/use-grupos';
import { GrupoCard } from '@/features/grupos/components/GrupoCard';
import type { Grupo } from '@/types/database';

const SERIF = 'PlayfairDisplay_500Medium';

export default function SocialScreen() {
  const theme = useChurchTheme();
  const qc = useQueryClient();
  const { data: grupos, isLoading } = useGrupos();

  useFocusEffect(useCallback(() => {
    qc.invalidateQueries({ queryKey: ['grupos'] });
  }, [qc]));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <FlatList
        data={grupos ?? []}
        keyExtractor={(g: Grupo) => g.id}
        renderItem={({ item }: { item: Grupo }) => (
          <GrupoCard
            grupo={item}
            onPress={() => router.push(`/comunidade/grupos/${item.id}` as never)}
          />
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.heading, { color: theme.text, fontFamily: SERIF }]}>Grupos</Text>
            <View style={styles.actions}>
              <Pressable
                style={[styles.btn, { backgroundColor: theme.accent }]}
                onPress={() => router.push('/comunidade/grupos/novo' as never)}
              >
                <Plus size={16} color="#fff" strokeWidth={2.5} />
                <Text style={styles.btnText}>Criar grupo</Text>
              </Pressable>
              <Pressable
                style={[styles.btnOutline, { borderColor: theme.elevated }]}
                onPress={() => router.push('/comunidade/grupos/entrar' as never)}
              >
                <LogIn size={16} color={theme.text} strokeWidth={1.8} />
                <Text style={[styles.btnOutlineText, { color: theme.text }]}>Entrar com código</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.empty}>
              <MessageCircle size={52} color={theme.textMuted} strokeWidth={1} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Nenhum grupo ainda</Text>
              <Text style={[styles.emptyMsg, { color: theme.textMuted }]}>
                Crie um grupo ou entre com um código de convite para começar a conversar
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 10 },
  header: { marginBottom: 8 },
  heading: { fontSize: 28, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  btnOutline: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12, borderWidth: 1,
  },
  btnOutlineText: { fontSize: 14, fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 48, gap: 10, paddingHorizontal: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 4 },
  emptyMsg: { textAlign: 'center', fontSize: 14, lineHeight: 20 },
});
