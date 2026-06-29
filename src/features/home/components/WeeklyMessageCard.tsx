import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLatestWeeklyMessage } from '@/features/weekly-message/hooks/use-weekly-message';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

export function WeeklyMessageCard() {
  const theme = useChurchTheme();
  const { data, isLoading, error } = useLatestWeeklyMessage();

  if (isLoading) {
    return (
      <Card>
        <ActivityIndicator color={theme.primary} />
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <EmptyState title="Palavra da semana" message="Nenhuma mensagem publicada ainda." />
      </Card>
    );
  }

  return (
    <Card>
      <Text style={[styles.label, { color: theme.secondary }]}>Palavra da semana</Text>
      <Text style={[styles.title, { color: theme.text }]}>{data.title}</Text>
      <Text style={[styles.content, { color: theme.textMuted }]} numberOfLines={4}>
        {data.content}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  content: { fontSize: 15, lineHeight: 22 },
});
