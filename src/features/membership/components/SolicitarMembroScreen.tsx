import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CheckCircle2, Clock, Heart, ShieldCheck, Users, XCircle } from 'lucide-react-native';

import { useChurchTheme } from '@/theme/ChurchThemeProvider';
import { useMembershipRequest } from '@/features/membership/hooks/use-membership-request';

const SERIF = 'PlayfairDisplay_500Medium';

const BENEFITS = [
  { icon: Users, text: 'Participar de células e grupos da igreja' },
  { icon: Heart, text: 'Acompanhar pedidos de oração da comunidade' },
  { icon: ShieldCheck, text: 'Acesso a áreas e eventos exclusivos para membros' },
];

export default function SolicitarMembroScreen() {
  const theme = useChurchTheme();
  const { status, isLoading, isRequesting, requestMembership } = useMembershipRequest();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text, fontFamily: SERIF }]}>
          Quero me tornar membro
        </Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Ser membro significa fazer parte oficialmente da nossa comunidade, com acesso a mais
          recursos do app e da igreja.
        </Text>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          {BENEFITS.map(({ icon: Icon, text }) => (
            <View key={text} style={styles.benefitRow}>
              <View style={[styles.iconWrap, { backgroundColor: theme.elevated }]}>
                <Icon size={16} color={theme.accent} strokeWidth={1.8} />
              </View>
              <Text style={[styles.benefitText, { color: theme.text }]}>{text}</Text>
            </View>
          ))}
        </View>

        {status === 'pendente' && (
          <View style={[styles.statusCard, { backgroundColor: theme.elevated }]}>
            <Clock size={18} color={theme.textMuted} strokeWidth={1.8} />
            <Text style={[styles.statusText, { color: theme.textMuted }]}>
              Aguardando aprovação do admin
            </Text>
          </View>
        )}

        {status === 'negado' && (
          <View style={[styles.statusCard, { backgroundColor: '#FEE2E2' }]}>
            <XCircle size={18} color="#DC2626" strokeWidth={1.8} />
            <Text style={[styles.statusText, { color: '#DC2626' }]}>
              Solicitação negada. Tente novamente.
            </Text>
          </View>
        )}

        {status === 'member' && (
          <View style={[styles.statusCard, { backgroundColor: theme.elevated }]}>
            <CheckCircle2 size={18} color={theme.accent} strokeWidth={1.8} />
            <Text style={[styles.statusText, { color: theme.text }]}>Você já é membro.</Text>
          </View>
        )}

        {(status === 'none' || status === 'negado') && (
          <Pressable
            style={[styles.btn, { backgroundColor: theme.text }, isRequesting && styles.disabled]}
            onPress={() => requestMembership()}
            disabled={isRequesting || isLoading}
          >
            <Text style={[styles.btnText, { color: theme.background }]}>
              {isRequesting ? 'Enviando...' : status === 'negado' ? 'Solicitar novamente' : 'Solicitar'}
            </Text>
          </Pressable>
        )}

        {status !== 'none' && status !== 'negado' && (
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={[styles.backText, { color: theme.textMuted }]}>Voltar</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 24, paddingBottom: 48, gap: 16 },
  title: { fontSize: 24, lineHeight: 30 },
  subtitle: { fontSize: 14, lineHeight: 21 },
  card: { borderRadius: 16, padding: 18, gap: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: { flex: 1, fontSize: 14, lineHeight: 20 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 16,
  },
  statusText: { flex: 1, fontSize: 14, fontWeight: '500' },
  btn: { borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 4 },
  btnText: { fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.6 },
  backBtn: { alignItems: 'center', padding: 12 },
  backText: { fontSize: 14 },
});
