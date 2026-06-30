import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useLatestWeeklyMessage } from '@/features/weekly-message/hooks/use-weekly-message';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

const SERIF_REGULAR = 'PlayfairDisplay_400Regular';
const SERIF_MEDIUM = 'PlayfairDisplay_500Medium';

export function WeeklyMessageCard() {
  const theme = useChurchTheme();
  const { data, isLoading } = useLatestWeeklyMessage();

  if (isLoading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <Text style={[styles.label, { color: theme.accent }]}>PALAVRA DA SEMANA</Text>
      {data ? (
        <>
          <Text style={[styles.title, { color: theme.text, fontFamily: SERIF_MEDIUM }]}>{data.title}</Text>
          <Text style={[styles.content, { color: theme.textMuted }]} numberOfLines={3}>
            {data.content}
          </Text>
          <Pressable style={styles.learnMore}>
            <Text style={[styles.learnMoreText, { color: theme.accent }]}>
              Ler mais  →
            </Text>
          </Pressable>
        </>
      ) : (
        <Text style={[styles.empty, { color: theme.textMuted, fontFamily: SERIF_REGULAR }]}>
          Nenhuma mensagem{'\n'}publicada ainda.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 22,
    gap: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
  },
  content: {
    fontSize: 14,
    lineHeight: 22,
  },
  learnMore: { marginTop: 4 },
  learnMoreText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  empty: {
    fontSize: 18,
    lineHeight: 28,
  },
});
