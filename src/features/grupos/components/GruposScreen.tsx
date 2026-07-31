import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useFocusEffect } from 'expo-router';
import { LogIn, Plus } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGrupos } from '@/features/grupos/hooks/use-grupos';
import { GrupoCard } from '@/features/grupos/components/GrupoCard';

const SERIF = 'PlayfairDisplay_500Medium';

export function GruposScreen() {
  const theme = useChurchTheme();
  const qc = useQueryClient();
  const { data: grupos, isLoading } = useGrupos();

  useFocusEffect(useCallback(() => {
    qc.invalidateQueries({ queryKey: ['grupos'] });
  }, [qc]));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: true, title: 'Grupos' }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: theme.text, fontFamily: SERIF }]}>Meus Grupos</Text>

        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, { backgroundColor: theme.accent }]}
            onPress={() => router.push('/comunidade/grupos/novo' as never)}
          >
            <Plus size={15} color="#fff" strokeWidth={2.5} />
            <Text style={styles.btnText}>Criar grupo</Text>
          </Pressable>
          <Pressable
            style={[styles.btnOutline, { borderColor: theme.elevated }]}
            onPress={() => router.push('/comunidade/grupos/entrar' as never)}
          >
            <LogIn size={15} color={theme.text} strokeWidth={1.8} />
            <Text style={[styles.btnOutlineText, { color: theme.text }]}>Entrar com código</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
        ) : !grupos || grupos.length === 0 ? (
          <EmptyState
            title="Você ainda não faz parte de nenhum grupo"
            message="Crie um grupo ou entre com um código de convite."
          />
        ) : (
          <View style={styles.list}>
            {grupos.map((grupo) => (
              <GrupoCard
                key={grupo.id}
                grupo={grupo}
                onPress={() => router.push(`/comunidade/grupos/${grupo.id}` as never)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  heading: { fontSize: 24 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 11, borderRadius: 12,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  btnOutline: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 11, borderRadius: 12, borderWidth: 1,
  },
  btnOutlineText: { fontSize: 14, fontWeight: '500' },
  list: { gap: 10 },
});
