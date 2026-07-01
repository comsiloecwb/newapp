import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useChurchTheme } from '@/theme/ChurchThemeProvider';

const DARK_BG = '#160A2E';
const GOLD = '#C9A84C';
const SERIF = 'PlayfairDisplay_500Medium';
const SERIF_REG = 'PlayfairDisplay_400Regular';

export type Palavra = {
  id: string;
  title: string;
  reference: string;
  summary: string;
  content: string;
  preacher: string;
  date: string;
};

export const MOCK_PALAVRAS: Palavra[] = [
  {
    id: '1',
    title: 'A Fé que Move Montanhas',
    reference: 'Mateus 17:20',
    summary: 'Como a fé genuína transforma circunstâncias impossíveis e nos posiciona para receber as promessas de Deus em nossa vida.',
    content: `"Porque em verdade vos digo que, se tiverdes fé como um grão de mostarda, direis a este monte: Passa daqui para acolá, e ele passará, e nada vos será impossível." — Mateus 17:20\n\nA fé não é um sentimento. Fé é uma postura diante de Deus que declara: "Mesmo que eu não veja, eu creio."\n\nJesus não estava falando de montanhas literais quando ensinou sobre a fé. Ele falava das situações que parecem impossíveis de remover — um diagnóstico médico, uma relação restaurada, uma dívida quitada, um filho que voltou.\n\nO grão de mostarda é pequeno, mas contém vida. A fé não precisa ser grande; precisa ser viva. Precisa estar plantada no solo certo: a Palavra de Deus.\n\nPraticando a fé:\n• Declare as promessas de Deus sobre sua situação diariamente\n• Aja como se o milagre já fosse realidade\n• Permaneça fiel nos pequenos passos\n• Cerque-se de pessoas que caminham pela fé\n\nDeus não mente. Sua Palavra não volta vazia. A montanha que está diante de você hoje pode ser o próximo testemunho que você vai contar.`,
    preacher: 'Pr. João Mendes',
    date: '2026-06-29',
  },
  {
    id: '2',
    title: 'Graça Suficiente',
    reference: '2 Coríntios 12:9',
    summary: 'A graça de Deus não remove as fraquezas, ela opera através delas. Nossa fragilidade é o espaço onde o poder de Cristo se manifesta.',
    content: `"E disse-me: A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza." — 2 Coríntios 12:9\n\nPaulo pediu três vezes que o espinho fosse removido. Três vezes. E a resposta de Deus não foi "sim" — foi algo melhor: "Minha graça é suficiente."\n\nQuantas vezes pedimos para Deus remover a dificuldade, quando Ele quer nos fortalecer dentro dela?\n\nA graça suficiente não é a ausência de sofrimento. É a presença de Deus que sustenta no meio do sofrimento.\n\nTrês dimensões da graça suficiente:\n1. Graça que perdoa — onde o pecado abundou, superabundou a graça\n2. Graça que sustenta — poder suficiente para o dia de hoje\n3. Graça que transforma — o espinho que humilha se torna o altar onde Deus é glorificado\n\nNão fuja da sua fraqueza. Apresente-a a Deus. É exatamente ali que Ele se mostra forte.`,
    preacher: 'Pr. João Mendes',
    date: '2026-06-22',
  },
  {
    id: '3',
    title: 'O Pai que Corre ao Encontro',
    reference: 'Lucas 15:20',
    summary: 'A parábola do filho pródigo revela o coração do Pai: não espera que o filho chegue, mas corre ao encontro dele enquanto ainda está longe.',
    content: `"E, levantando-se, foi para seu pai; e quando ainda estava longe, seu pai o viu e, movido de íntima compaixão, correu, e lançou-se sobre o seu pescoço, e o beijou." — Lucas 15:20\n\nEsta é uma das imagens mais poderosas de toda a Bíblia. Um pai que vê o filho enquanto ainda está longe. Que corre. Que abraça antes mesmo de ouvir o pedido de desculpas.\n\nIsso é o coração de Deus para você.\n\nO filho voltou com um discurso preparado: "Não sou mais digno de ser chamado teu filho; faze-me como um dos teus jornaleiros." Mas o pai não ouviu o discurso até o fim. Ele já estava abraçando.\n\nQuando você se arrepende:\n• Deus não espera — Ele já está correndo na sua direção\n• Deus não critica — Ele abraça primeiro\n• Deus não rebaixa — Ele restaura a identidade (o anel, as sandálias, a roupa)\n\nNão importa o que você fez ou para onde foi. Quando você se voltar para o Pai, você vai encontrá-Lo correndo ao seu encontro.`,
    preacher: 'Pr. Carlos Rocha',
    date: '2026-06-15',
  },
  {
    id: '4',
    title: 'Propósito nas Tempestades',
    reference: 'João 16:33',
    summary: 'Jesus não prometeu vida sem tempestades. Prometeu que Ele já venceu. E que podemos ter paz no meio, não na ausência, das tribulações.',
    content: `"No mundo passareis por tribulações, mas tende bom ânimo; eu venci o mundo." — João 16:33\n\nEsta é uma das afirmações mais honestas de Jesus. Ele não disse "se vocês forem bons cristãos não vão sofrer." Ele disse: "No mundo vocês vão sofrer."\n\nMas há uma segunda parte dessa frase que muda tudo: "Eu venci o mundo."\n\nA paz cristã não é a ausência de tempestade. É a certeza de que o Capitão do navio já conhece o destino e ele é bom.\n\nO que fazer no meio da tempestade:\n1. Lembre das travessias anteriores — Deus já te livrou antes\n2. Mantenha os olhos no propósito, não no problema\n3. Cerque-se da comunidade — você não foi feito para navegar sozinho\n4. Ore com autoridade — você está orando para Aquele que venceu\n\nSua tempestade tem prazo de validade. E quando passar, ela vai ter sido o capítulo mais transformador da sua história.`,
    preacher: 'Pr. Ana Beatriz',
    date: '2026-06-08',
  },
];

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function PalavrasScreen() {
  const theme = useChurchTheme();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Palavras',
          headerStyle: { backgroundColor: DARK_BG },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontFamily: SERIF, fontSize: 17 },
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          <Text style={[styles.intro, { color: theme.textMuted }]}>
            {MOCK_PALAVRAS.length} mensagens disponíveis
          </Text>

          {MOCK_PALAVRAS.map((p) => (
            <Pressable
              key={p.id}
              style={({ pressed }) => [styles.card, { backgroundColor: theme.surface, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push(`/palavra/${p.id}` as never)}
            >
              <View style={styles.cardMain}>
                <Text style={[styles.reference, { color: GOLD }]}>{p.reference}</Text>
                <Text style={[styles.title, { color: theme.text, fontFamily: SERIF }]} numberOfLines={2}>
                  {p.title}
                </Text>
                <Text style={[styles.meta, { color: theme.textMuted }]}>
                  {p.preacher}  ·  {formatDate(p.date)}
                </Text>
                <Text style={[styles.summary, { color: theme.textMuted }]} numberOfLines={3}>
                  {p.summary}
                </Text>
              </View>
              <ChevronRight size={18} color={theme.textMuted} strokeWidth={1.6} style={{ flexShrink: 0 }} />
            </Pressable>
          ))}

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 12 },

  intro: { fontSize: 13, marginBottom: 4 },

  card: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  cardMain: { flex: 1, gap: 5 },
  reference: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  title: { fontSize: 17, lineHeight: 23 },
  meta: { fontSize: 12 },
  summary: { fontSize: 13, lineHeight: 19, marginTop: 2 },
});
