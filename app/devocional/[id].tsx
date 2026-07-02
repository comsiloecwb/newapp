import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2 } from 'lucide-react-native';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import {
  useGroupDevotionals,
  useGroupDevotionalDays,
  useGroupProgress,
  useMarkGroupDay,
} from '@/features/devotional/hooks/use-devotional';

const DARK_BG = '#0A1628';
const GREEN = '#16A34A';
const SERIF = 'PlayfairDisplay_500Medium';

export default function GroupDevotionalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useChurchTheme();

  const { data: devotionals = [] } = useGroupDevotionals();
  const { data: days = [], isLoading: daysLoading } = useGroupDevotionalDays(id);
  const { data: completedDays = [] } = useGroupProgress(id);
  const { mutate: markDay, isPending: marking } = useMarkGroupDay(id);

  const devotional = devotionals.find((d) => d.id === id);
  const completedSet = new Set(completedDays);
  const doneCount = completedDays.length;
  const currentDayNum = Math.min(doneCount + 1, devotional?.total_days ?? 1);

  if (!devotional) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: devotional.title,
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 17 },
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={[styles.header, { backgroundColor: DARK_BG }]}>
            {devotional.description && (
              <Text style={styles.headerDesc}>{devotional.description}</Text>
            )}
            <View style={styles.progressRow}>
              <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(doneCount / devotional.total_days) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>{doneCount}/{devotional.total_days}</Text>
            </View>
          </View>

          {daysLoading ? (
            <ActivityIndicator style={{ marginTop: 32 }} color={theme.accent} />
          ) : days.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Conteúdo em breve.
            </Text>
          ) : (
            days.map((day) => {
              const done = completedSet.has(day.day_number);
              const isCurrent = day.day_number === currentDayNum;
              const isLocked = day.day_number > currentDayNum;

              return (
                <View
                  key={day.id}
                  style={[
                    styles.dayCard,
                    { backgroundColor: theme.surface },
                    isCurrent && styles.dayCardCurrent,
                    isLocked && styles.dayCardLocked,
                  ]}
                >
                  <View style={styles.dayTop}>
                    <View style={[styles.dayBadge, { backgroundColor: done ? GREEN : DARK_BG }]}>
                      <Text style={styles.dayBadgeText}>
                        {done ? '✓' : `DIA ${day.day_number}`}
                      </Text>
                    </View>
                    {done && <CheckCircle2 size={18} color={GREEN} strokeWidth={1.8} />}
                    {isLocked && (
                      <Text style={[styles.lockedLabel, { color: theme.textMuted }]}>
                        🔒 Complete o dia anterior
                      </Text>
                    )}
                  </View>

                  <Text style={[styles.dayTitle, { color: isLocked ? theme.textMuted : theme.text, fontFamily: SERIF }]}>
                    {day.title}
                  </Text>
                  <Text style={[styles.dayPassage, { color: theme.goldText }]}>{day.passage}</Text>

                  {!isLocked && (
                    <>
                      <View style={[styles.divider, { backgroundColor: theme.elevated }]} />
                      <Text style={[styles.verseText, { color: theme.text }]}>{day.verse}</Text>
                      <Text style={[styles.reflectionText, { color: theme.text }]}>{day.reflection}</Text>
                      {day.prayer && (
                        <View style={[styles.prayerBox, { backgroundColor: theme.elevated }]}>
                          <Text style={[styles.prayerLabel, { color: theme.textMuted }]}>ORAÇÃO</Text>
                          <Text style={[styles.prayerText, { color: theme.text }]}>{day.prayer}</Text>
                        </View>
                      )}

                      {!done && isCurrent && (
                        <Pressable
                          style={[styles.doneBtn, marking && styles.disabled]}
                          onPress={() => markDay(day.day_number)}
                          disabled={marking}
                        >
                          <Text style={styles.doneBtnText}>
                            {marking ? 'Salvando...' : 'Marcar como lido'}
                          </Text>
                        </Pressable>
                      )}
                    </>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 48, gap: 12 },

  header: { padding: 24, gap: 12 },
  headerDesc: { fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 20 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#C9A84C', borderRadius: 3 },
  progressLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)', width: 40, textAlign: 'right' },

  dayCard: { marginHorizontal: 20, borderRadius: 16, padding: 18, gap: 8 },
  dayCardCurrent: { borderWidth: 1.5, borderColor: '#C9A84C' },
  dayCardLocked: { opacity: 0.5 },

  dayTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dayBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  dayBadgeText: { color: '#C9A84C', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  lockedLabel: { fontSize: 12 },

  dayTitle: { fontSize: 20, lineHeight: 26 },
  dayPassage: { fontSize: 13, fontWeight: '600' },

  divider: { height: StyleSheet.hairlineWidth },
  verseText: { fontSize: 15, lineHeight: 24, fontStyle: 'italic' },
  reflectionText: { fontSize: 14, lineHeight: 22 },

  prayerBox: { borderRadius: 10, padding: 14, gap: 6 },
  prayerLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  prayerText: { fontSize: 14, lineHeight: 22 },

  doneBtn: { marginTop: 4, backgroundColor: '#16A34A', borderRadius: 12, padding: 16, alignItems: 'center' },
  disabled: { opacity: 0.6 },
  doneBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 32, fontSize: 14 },
});
