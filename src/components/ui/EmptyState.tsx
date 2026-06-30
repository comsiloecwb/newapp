import { StyleSheet, Text, View } from 'react-native';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';

export function EmptyState({ title, message }: { title: string; message?: string }) {
  const theme = useChurchTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: theme.textMuted }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, { color: theme.textMuted }]}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 32, paddingHorizontal: 24, alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  message: { fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 20 },
});
