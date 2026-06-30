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
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
});
