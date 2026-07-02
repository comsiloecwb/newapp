export interface ReadingDay {
  day: number;
  title: string;
  theme: string;
  passages: string[];
}

export interface ReadingPlan {
  id: string;
  title: string;
  subtitle: string;
  totalDays: number;
  days: ReadingDay[];
}

export const FUNDAMENTOS_30: ReadingPlan = {
  id: 'fundamentos-30',
  title: 'Fundamentos da Fé',
  subtitle: 'Uma jornada de 30 dias pela história bíblica',
  totalDays: 30,
  days: [
    { day: 1,  title: 'A Criação',              theme: 'No princípio, Deus criou.',           passages: ['Gênesis 1–2', 'João 1:1-14'] },
    { day: 2,  title: 'A Queda',                theme: 'O pecado entra no mundo.',            passages: ['Gênesis 3', 'Romanos 3:9-26'] },
    { day: 3,  title: 'A Promessa',             theme: 'Deus chama Abraão.',                  passages: ['Gênesis 12:1-9', 'Gálatas 3:6-14'] },
    { day: 4,  title: 'A Aliança',              theme: 'Deus firma sua promessa.',             passages: ['Gênesis 15', 'Hebreus 6:13-20'] },
    { day: 5,  title: 'A Páscoa',               theme: 'Libertação do Egito.',                passages: ['Êxodo 12:1-30', 'João 1:29-36'] },
    { day: 6,  title: 'A Lei',                  theme: 'Os Dez Mandamentos.',                 passages: ['Êxodo 20:1-17', 'Mateus 5:17-20'] },
    { day: 7,  title: 'O Deserto',              theme: 'Quarenta anos de provação.',          passages: ['Números 14', 'Hebreus 3:7-19'] },
    { day: 8,  title: 'A Terra Prometida',      theme: 'Josué conduz o povo.',                passages: ['Josué 1', 'Hebreus 4:1-11'] },
    { day: 9,  title: 'Os Juízes',              theme: 'Ciclos de desobediência.',            passages: ['Juízes 2:6-23', 'Romanos 1:18-25'] },
    { day: 10, title: 'Samuel',                 theme: 'A voz do Senhor ao jovem.',           passages: ['1 Samuel 3', '1 Coríntios 1:26-31'] },
    { day: 11, title: 'Davi',                   theme: 'O homem segundo o coração de Deus.',  passages: ['1 Samuel 16', 'Atos 13:22-39'] },
    { day: 12, title: 'O Templo',               theme: 'Deus habita no meio do povo.',        passages: ['1 Reis 8:22-53', 'João 4:19-26'] },
    { day: 13, title: 'Os Profetas',            theme: 'A voz de Deus na história.',          passages: ['Isaías 53', 'Lucas 24:25-27'] },
    { day: 14, title: 'O Exílio',               theme: 'À beira dos rios da Babilônia.',      passages: ['Salmo 137', 'Romanos 11:25-36'] },
    { day: 15, title: 'O Retorno',              theme: 'Deus restaura seu povo.',             passages: ['Esdras 1', 'Apocalipse 21:1-8'] },
    { day: 16, title: 'O Nascimento',           theme: 'Deus se faz homem.',                  passages: ['Lucas 2:1-20', 'Isaías 9:2-7'] },
    { day: 17, title: 'O Batismo de Jesus',     theme: 'O Filho amado.',                      passages: ['Mateus 3', 'João 1:19-34'] },
    { day: 18, title: 'A Tentação',             theme: 'Jesus vence onde Adão falhou.',       passages: ['Mateus 4:1-11', 'Hebreus 4:14-16'] },
    { day: 19, title: 'O Sermão do Monte',      theme: 'Uma ética do Reino.',                 passages: ['Mateus 5:1-12', 'Tiago 1:22-25'] },
    { day: 20, title: 'Os Milagres',            theme: 'Sinais do Reino de Deus.',            passages: ['João 2:1-11', 'Marcos 4:35-41'] },
    { day: 21, title: 'As Parábolas',           theme: 'O Pai corre ao encontro do filho.',   passages: ['Lucas 15', 'Mateus 13:10-17'] },
    { day: 22, title: 'A Transfiguração',       theme: 'Um vislumbre da glória.',             passages: ['Mateus 17:1-13', '2 Pedro 1:16-21'] },
    { day: 23, title: 'A Entrada em Jerusalém', theme: 'O Rei chega em mansidão.',            passages: ['Lucas 19:28-44', 'Zacarias 9:9'] },
    { day: 24, title: 'A Última Ceia',          theme: 'A nova aliança no sangue de Cristo.', passages: ['Lucas 22:14-23', '1 Coríntios 11:23-26'] },
    { day: 25, title: 'A Cruz',                 theme: 'Deus paga o preço do pecado.',        passages: ['João 19', 'Isaías 52:13–53:12'] },
    { day: 26, title: 'A Ressurreição',         theme: 'A morte não tem a última palavra.',   passages: ['João 20', '1 Coríntios 15:1-28'] },
    { day: 27, title: 'A Ascensão',             theme: 'Jesus vai preparar lugar para nós.',  passages: ['Atos 1:1-11', 'João 14:1-6'] },
    { day: 28, title: 'O Pentecostes',          theme: 'O Espírito é derramado.',             passages: ['Atos 2:1-41', 'Joel 2:28-32'] },
    { day: 29, title: 'A Igreja',               theme: 'Um corpo, muitos membros.',           passages: ['Efésios 4:1-16', '1 Coríntios 12'] },
    { day: 30, title: 'A Volta de Cristo',      theme: 'O fim é um novo começo.',             passages: ['1 Tessalonicenses 4:13-18', 'Apocalipse 22'] },
  ],
};

export const PLANS: ReadingPlan[] = [FUNDAMENTOS_30];
