import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGrupos } from '@/features/grupos/hooks/use-grupos';
import { GrupoCard } from '@/features/grupos/components/GrupoCard';

const SERIF = 'PlayfairDisplay_500Medium';

export function GruposScreen() {
  const theme = useChurchTheme();
  const { data: grupos, isLoading } = useGrupos();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: true, title: 'Grupos' }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: theme.text, fontFamily: SERIF }]}>Meus Grupos</Text>

        {isLoading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
        ) : !grupos || grupos.length === 0 ? (
          <EmptyState
            title="Você ainda não faz parte de nenhum grupo"
            message="Quando você for adicionado a um grupo, ele vai aparecer aqui."
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
  list: { gap: 10 },
});
