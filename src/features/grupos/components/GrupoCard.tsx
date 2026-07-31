import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, Users } from 'lucide-react-native';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import type { Grupo } from '@/types/database';

export function GrupoCard({ grupo, onPress }: { grupo: Grupo; onPress: () => void }) {
  const theme = useChurchTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.elevated }]}>
        <Users size={18} color={theme.accent} strokeWidth={1.8} />
      </View>
      <Text style={[styles.nome, { color: theme.text }]} numberOfLines={1}>
        {grupo.nome}
      </Text>
      <ChevronRight size={18} color={theme.textMuted} strokeWidth={1.8} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 14,
    padding: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nome: { flex: 1, fontSize: 15, fontWeight: '500' },
});
