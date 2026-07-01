import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

const DARK_BG = '#071A10';
const SERIF = 'PlayfairDisplay_500Medium';
const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 20 * 2 - 6 * 2) / 3;

const PHOTO_COLORS = [
  '#2C3E50', '#8B4513', '#1A3A4A', '#3D2B1F',
  '#2E4057', '#4A2040', '#1B3A2D', '#3A2010',
  '#1E3A5F', '#3B1F2B', '#2A3D1F', '#1F2A3D',
];

const MOCK_PHOTOS = PHOTO_COLORS.map((color, i) => ({
  id: `ph${i}`,
  color,
  label: i === 0 ? 'Culto Dom.' : i === 1 ? 'Louvor' : i === 2 ? 'EBD' : '',
}));

export default function FotosScreen() {
  const theme = useChurchTheme();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Fotos da Semana',
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 17 },
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          <Text style={[styles.sub, { color: theme.textMuted }]}>
            Momentos do culto e eventos desta semana.
          </Text>

          <View style={styles.grid}>
            {MOCK_PHOTOS.map((p) => (
              <View key={p.id} style={[styles.cell, { backgroundColor: p.color }]}>
                {p.label ? <Text style={styles.cellLabel}>{p.label}</Text> : null}
              </View>
            ))}
          </View>

          <Text style={[styles.note, { color: theme.textMuted }]}>
            As fotos são carregadas pelo administrador pelo painel web.
          </Text>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },
  sub: { fontSize: 13, lineHeight: 19 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  note: { fontSize: 12, textAlign: 'center' },
});
