import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

export default function CelulasScreen() {
  const theme = useChurchTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <View style={styles.center}>
        <Text style={styles.icon}>🏠</Text>
        <Text style={[styles.title, { color: theme.text }]}>Células</Text>
        <Text style={[styles.sub, { color: theme.textMuted }]}>Em breve</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  icon: { fontSize: 36 },
  title: { fontSize: 20, fontWeight: '600', letterSpacing: 0.3 },
  sub: { fontSize: 14 },
});
