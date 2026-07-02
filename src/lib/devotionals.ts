export interface DailyDevotional {
  day: number; // 1-30, cicla pelo dia do mês
  title: string;
  passage: string;
  verse: string;
  reflection: string;
  prayer: string;
}

export interface GroupDevotionalDay {
  id: string;
  devotional_id: string;
  day_number: number;
  title: string;
  passage: string;
  verse: string;
  reflection: string;
  prayer: string;
}

export interface GroupDevotional {
  id: string;
  church_id: string;
  title: string;
  description: string | null;
  total_days: number;
  published: boolean;
  created_at: string;
}

// Retorna o devocional do dia com base no dia do mês (1-30)
export function getTodayDevotional(): DailyDevotional {
  const dayOfMonth = new Date().getDate();
  const idx = ((dayOfMonth - 1) % DAILY_DEVOTIONALS.length);
  return DAILY_DEVOTIONALS[idx];
}

export const DAILY_DEVOTIONALS: DailyDevotional[] = [
  {
    day: 1,
    title: 'No Princípio',
    passage: 'Gênesis 1:1-3',
    verse: '"No princípio, Deus criou os céus e a terra. A terra era sem forma e vazia... E disse Deus: Haja luz. E houve luz."',
    reflection: 'Deus cria do nada — não porque precisava, mas porque quis. Cada amanhecer é um lembrete de que Ele ainda está criando, ordenando o caos da nossa vida com sua Palavra.',
    prayer: 'Senhor, que a tua voz fale sobre o caos da minha vida hoje e traga luz onde há escuridão.',
  },
  {
    day: 2,
    title: 'Deus Me Conhece',
    passage: 'Salmo 139:1-6',
    verse: '"Senhor, tu me sondas e me conheces. Tu sabes quando me sento e quando me levanto."',
    reflection: 'Não há nada em você que Deus não veja — e mesmo assim Ele te ama. Ser completamente conhecido e ainda assim completamente amado é a fundação de toda segurança espiritual.',
    prayer: 'Pai, obrigado por me conhecer até onde eu mesmo não me conheço. Que esse conhecimento me dê descanso hoje.',
  },
  {
    day: 3,
    title: 'A Fonte de Vida',
    passage: 'João 4:13-14',
    verse: '"Mas quem beber da água que eu lhe der nunca terá sede novamente."',
    reflection: 'Corremos atrás de tantas fontes que prometem satisfação mas deixam sede. Jesus oferece algo diferente — uma fonte que brota de dentro para fora.',
    prayer: 'Jesus, sacia a sede que nenhuma outra coisa consegue. Que eu beba de Ti antes de qualquer outra fonte hoje.',
  },
  {
    day: 4,
    title: 'A Paz Que Guarda',
    passage: 'Filipenses 4:6-7',
    verse: '"Não andeis ansiosos por coisa alguma; antes, em tudo fazei as vossas petições conhecidas diante de Deus."',
    reflection: 'A ansiedade nos diz que temos que resolver tudo. A oração nos lembra que há Alguém que pode. A paz de Deus não depende das circunstâncias — ela guarda o coração no meio delas.',
    prayer: 'Senhor, recebo hoje a paz que excede qualquer entendimento. Guarda minha mente e meu coração em Cristo Jesus.',
  },
  {
    day: 5,
    title: 'Renovação Diária',
    passage: 'Lamentações 3:22-23',
    verse: '"As misericórdias do Senhor não têm fim, as suas compaixões não se esgotam. Renovam-se cada manhã."',
    reflection: 'Ontem pode ter sido difícil. Mas hoje é um dia novo — com misericórdias novas. Deus não está com saldo zerado de graça para te dar. Ela se renova.',
    prayer: 'Pai, recebo as misericórdias novas deste dia. Não vou carregar o peso de ontem; tu fazes novo o que estava velho.',
  },
  {
    day: 6,
    title: 'Confiança Total',
    passage: 'Provérbios 3:5-6',
    verse: '"Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento."',
    reflection: 'Confiar "de todo o coração" significa entregar até as partes que queremos controlar. O entendimento humano tem limites; a sabedoria de Deus, não.',
    prayer: 'Senhor, onde eu insisto em controlar, ajuda-me a soltar. Dirijo teus caminhos e não os meus hoje.',
  },
  {
    day: 7,
    title: 'Força no Cansaço',
    passage: 'Isaías 40:29-31',
    verse: '"Ele dá força ao cansado e poder bastante ao que é fraco."',
    reflection: 'O cansaço espiritual não é falha de caráter — é sinal de que você precisa de uma fonte que não se esgota. Deus se especializa em renovar os que reconhecem sua fraqueza.',
    prayer: 'Senhor, estou cansado. Renova minhas forças como águia. Que eu corra sem me cansar, que eu ande sem me abater.',
  },
  {
    day: 8,
    title: 'Deus Conosco',
    passage: 'Mateus 1:23',
    verse: '"Eis que uma virgem conceberá e dará à luz um filho, e chamarás seu nome Emanuel, que traduzido é: Deus conosco."',
    reflection: 'O maior milagre não é que Deus criou o universo — é que Ele entrou nele. Emanuel não é um título distante; é uma promessa presente: Ele está aqui, agora, com você.',
    prayer: 'Jesus, obrigado por não ficar longe. Tu estás comigo neste dia, neste momento. Que eu viva com essa consciência.',
  },
  {
    day: 9,
    title: 'O Bom Pastor',
    passage: 'Salmo 23:1-3',
    verse: '"O Senhor é o meu pastor; nada me faltará. Ele me faz repousar em pastos verdejantes."',
    reflection: 'Um pastor não apenas guia — ele provê, protege e conhece cada ovelha pelo nome. Você não está perdido num campo aberto; há um Guia que conhece o caminho.',
    prayer: 'Bom Pastor, guia meus passos hoje. Onde eu precisar repousar, leva-me. Onde precisar avançar, vai à frente.',
  },
  {
    day: 10,
    title: 'Luz no Caminho',
    passage: 'Salmo 119:105',
    verse: '"A tua palavra é lâmpada que ilumina os meus passos e luz que clareia o meu caminho."',
    reflection: 'Uma lâmpada não ilumina todo o percurso de uma vez — ilumina o passo seguinte. A Palavra de Deus funciona assim: basta luz para o próximo passo.',
    prayer: 'Senhor, que tua Palavra ilumine minha próxima decisão, minha próxima conversa, meu próximo passo.',
  },
  {
    day: 11,
    title: 'O Amor do Pai',
    passage: 'Lucas 15:20',
    verse: '"Quando ainda estava longe, seu pai o viu e se encheu de compaixão, correu, lançou-se sobre o seu pescoço e o beijou."',
    reflection: 'Deus não espera que você chegue limpo para correr ao seu encontro. A parábola é clara: Ele vê você enquanto ainda está longe e corre na sua direção.',
    prayer: 'Pai, obrigado por correr em minha direção. Que eu não fique esperando estar "pronto" para voltar para Ti.',
  },
  {
    day: 12,
    title: 'Filhos de Deus',
    passage: 'João 1:12-13',
    verse: '"Mas a todos os que o receberam, aos que creem no seu nome, deu-lhes o poder de se tornarem filhos de Deus."',
    reflection: 'Ser filho de Deus não é um status conquistado — é um dom recebido. Filho tem acesso, tem herança, tem o coração do Pai. Essa é sua identidade hoje.',
    prayer: 'Pai, que eu viva hoje como filho — não como escravo nem como estranho. Que a consciência da minha identidade mude como eu ajo e como eu falo.',
  },
  {
    day: 13,
    title: 'Sede de Deus',
    passage: 'Salmo 42:1-2',
    verse: '"Como o cervo anseia pelas correntes das águas, assim a minha alma anseia por ti, ó Deus."',
    reflection: 'A saudade de Deus é o instinto mais profundo da alma humana. Quando você se sente vazio sem saber por quê, talvez seja isso: sua alma está com sede do único que pode saciá-la.',
    prayer: 'Deus, que minha alma tenha sede de Ti acima de qualquer outra coisa. Que eu busque as correntes e não os atalhos.',
  },
  {
    day: 14,
    title: 'Fruto que Permanece',
    passage: 'João 15:5',
    verse: '"Eu sou a videira; vós, os ramos. Quem permanece em mim e eu nele, esse dá muito fruto."',
    reflection: 'Nenhum ramo produz fruto por esforço próprio — ele simplesmente permanece conectado. Nossa ansiedade por "produzir" muitas vezes nos separa da única fonte de fruto real.',
    prayer: 'Jesus, ensina-me a permanecer. Menos agitação, mais conexão. Que o fruto venha da união e não do esforço.',
  },
  {
    day: 15,
    title: 'Chamado pelo Nome',
    passage: 'Isaías 43:1',
    verse: '"Não temas, porque eu te resgatei; chamei-te pelo teu nome, tu és meu."',
    reflection: 'Deus não nos trata em massa — Ele nos chama pelo nome. Você não é um número na fila da graça. Você é conhecido, é resgatado, e pertence a Ele.',
    prayer: 'Senhor, que hoje eu ouça meu nome sendo chamado por Ti. Que o "tu és meu" redefina como eu enfrento os desafios deste dia.',
  },
  {
    day: 16,
    title: 'Alegria Completa',
    passage: 'João 16:24',
    verse: '"Até agora nada pedistes em meu nome; pedi e recebereis, para que a vossa alegria seja completa."',
    reflection: 'A oração não é uma obrigação — é um convite para uma alegria que o mundo não pode dar nem tirar. Deus quer que você peça, não porque precisa ser convencido, mas porque a busca transforma o buscador.',
    prayer: 'Jesus, venho ao Pai em teu nome. Que minha alegria seja completa — não baseada em circunstâncias mas em ti.',
  },
  {
    day: 17,
    title: 'Transformados',
    passage: 'Romanos 12:2',
    verse: '"Não vos conformeis com este século, mas transformai-vos pela renovação do vosso entendimento."',
    reflection: 'Conformar é o caminho fácil — o mundo já tem um molde pronto para você. Transformação exige um contrapeso: a renovação da mente pela Palavra e pelo Espírito.',
    prayer: 'Senhor, renova minha mente hoje. Onde eu penso como o mundo, ensina-me a pensar como o Reino.',
  },
  {
    day: 18,
    title: 'Nada nos Separa',
    passage: 'Romanos 8:38-39',
    verse: '"Estou convicto de que nem morte, nem vida... nem qualquer outra criatura nos poderá separar do amor de Deus."',
    reflection: 'Paulo não diz "nada nos afasta do amor" — ele diz "nada nos pode separar". É uma impossibilidade, não apenas uma esperança. O amor de Deus por você é um fato imutável.',
    prayer: 'Pai, que essa verdade ancore minha alma hoje. Aconteça o que acontecer, teu amor não me larga.',
  },
  {
    day: 19,
    title: 'Graça Suficiente',
    passage: '2 Coríntios 12:9',
    verse: '"A minha graça é suficiente para ti, porque o meu poder se aperfeiçoa na fraqueza."',
    reflection: 'Deus não remove a fraqueza para mostrar seu poder — Ele a usa como palco. O que você considera seu maior obstáculo pode ser o lugar onde a glória de Deus mais brilha.',
    prayer: 'Senhor, na minha fraqueza, sê minha força. Que tua graça seja suficiente — não no futuro, mas aqui, agora.',
  },
  {
    day: 20,
    title: 'Esperança Viva',
    passage: '1 Pedro 1:3',
    verse: '"Ele nos gerou de novo para uma esperança viva, por meio da ressurreição de Jesus Cristo dentre os mortos."',
    reflection: 'Esperança cristã não é otimismo — é certeza fundamentada num fato histórico: a ressurreição de Jesus. O que Deus fez com o túmulo, Ele pode fazer com qualquer situação morta em sua vida.',
    prayer: 'Deus da ressurreição, fala sobre as situações mortas em minha vida. Tua esperança é viva porque Tu és vivo.',
  },
  {
    day: 21,
    title: 'Andar no Espírito',
    passage: 'Gálatas 5:16',
    verse: '"Andai no Espírito, e não satisfareis os desejos da carne."',
    reflection: '"Andar" é um verbo contínuo — não uma decisão única, mas um ritmo de vida. Ceder ao Espírito é menos sobre resistência e mais sobre orientação: para onde sua atenção caminha?',
    prayer: 'Espírito Santo, que eu ande contigo hoje. Cada passo, cada escolha, cada palavra — que seja guiado por Ti.',
  },
  {
    day: 22,
    title: 'O Maior Mandamento',
    passage: 'Mateus 22:37-39',
    verse: '"Amarás ao Senhor teu Deus de todo o teu coração... Este é o grande e primeiro mandamento."',
    reflection: 'Quando o amor a Deus está certo, o amor ao próximo flui. A maioria dos nossos problemas de relacionamento são problemas de prioridade — quem ocupa o primeiro lugar?',
    prayer: 'Senhor, que o amor a Ti seja a raiz de tudo. Que eu ame meu próximo como transbordamento do teu amor em mim.',
  },
  {
    day: 23,
    title: 'Perdão Que Liberta',
    passage: 'Colossenses 3:13',
    verse: '"Suportai-vos uns aos outros e perdoai-vos mutuamente... assim como o Senhor vos perdoou, assim fazei vós também."',
    reflection: 'Perdoar não é fingir que não doeu — é soltar o direito de cobrar. E a força para fazer isso vem de lembrar o quanto você já foi perdoado.',
    prayer: 'Pai, traz à minha memória o quanto fui perdoado. Que esse lembrete me dê força para perdoar quem me feriu.',
  },
  {
    day: 24,
    title: 'Generosidade',
    passage: '2 Coríntios 9:7',
    verse: '"Cada um contribua segundo propôs no seu coração, não com tristeza ou por necessidade, porque Deus ama ao que dá com alegria."',
    reflection: 'A generosidade não é sobre o quanto você dá, mas sobre o coração com que dá. Ela é o ato mais anti-ansiedade que existe — declarar com suas mãos que você confia na provisão de Deus.',
    prayer: 'Senhor, liberta meu coração para a generosidade. Que eu dê com alegria porque confio que Tu és suficiente.',
  },
  {
    day: 25,
    title: 'Servir é Grandeza',
    passage: 'Marcos 10:43-45',
    verse: '"Qualquer que entre vós quiser ser grande, será esse o que vos serve... porque o Filho do homem também não veio para ser servido, mas para servir."',
    reflection: 'Jesus redefiniu grandeza. O mundo empurra para cima; o Reino convida para baixo — não como humilhação, mas como o movimento de quem está seguro o suficiente para não precisar de status.',
    prayer: 'Jesus, que eu siga teu exemplo. Onde houver oportunidade de servir hoje, que eu não a passe para outro.',
  },
  {
    day: 26,
    title: 'Palavra Que Permanece',
    passage: 'Mateus 24:35',
    verse: '"O céu e a terra passarão, mas as minhas palavras não passarão."',
    reflection: 'Em um mundo de incertezas — econômicas, relacionais, de saúde — há uma âncora que não muda: a Palavra de Deus. O que Ele prometeu, Ele cumpre. Sempre.',
    prayer: 'Senhor, ancore minha vida nas tuas promessas. Que eu construa sobre o que não pode ser abalado.',
  },
  {
    day: 27,
    title: 'Oração Perseverante',
    passage: 'Lucas 18:1',
    verse: '"Jesus contou-lhes uma parábola para mostrar que deviam orar sempre e não desanimar."',
    reflection: 'Persistir em oração não é convencer Deus — é permanecer em contato com Ele enquanto o tempo do Pai amadurece as respostas. A oração não muda Deus; transforma quem ora.',
    prayer: 'Pai, dá-me perseverança para continuar orando pelo que ainda não vi. Não vou desanimar.',
  },
  {
    day: 28,
    title: 'Comunidade',
    passage: 'Atos 2:42',
    verse: '"E perseveravam na doutrina dos apóstolos, na comunhão, no partir do pão e nas orações."',
    reflection: 'A fé cristã não foi projetada para ser solitária. Perseverar juntos na Palavra, na comunhão e na oração é o ritmo de vida que a igreja primitiva descobriu — e que continua sendo o mesmo hoje.',
    prayer: 'Senhor, agradeço pela comunidade de fé. Que eu seja presente, contribuindo e não apenas consumindo.',
  },
  {
    day: 29,
    title: 'Missão',
    passage: 'Mateus 28:19-20',
    verse: '"Ide, portanto, fazei discípulos de todas as nações... E eis que estou convosco todos os dias, até a consumação do século."',
    reflection: 'A Grande Comissão não é tarefa para especialistas — é o ritmo de vida de qualquer discípulo. Fazer discípulos começa com a pessoa ao seu lado. E a promessa que acompanha o envio é presença, não poder.',
    prayer: 'Jesus, quem na minha vida precisa conhecer quem Tu és? Abre meus olhos e minha boca.',
  },
  {
    day: 30,
    title: 'Maranata',
    passage: 'Apocalipse 22:20',
    verse: '"Sim, venho em breve. Amém! Vem, Senhor Jesus!"',
    reflection: 'Toda a história caminha para um ponto: o retorno de Cristo. Viver com essa perspectiva muda nossas prioridades hoje. O que você faria diferente se soubesse que Ele vem logo?',
    prayer: 'Vem, Senhor Jesus. Que eu viva hoje à luz da tua volta — com urgência, com esperança e com amor.',
  },
];
