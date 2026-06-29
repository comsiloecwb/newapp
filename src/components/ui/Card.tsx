import { StyleSheet, View, type ViewProps } from 'react-native';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';

export function Card({ style, ...props }: ViewProps) {
  const theme = useChurchTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.surface }, style]} {...props} />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
