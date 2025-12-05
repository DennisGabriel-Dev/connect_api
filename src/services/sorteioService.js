import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Verifica se modelo existe no Prisma
async function tabelaExiste(modelName) {
  try {
    if (!prisma[modelName]) return false;
    await prisma[modelName].findFirst();
    return true;
  } catch {
    return false;
  }
}

/**
 * Filtros flexíveis:
 * - nomeContains: string (filtro por nome do participante)
 * - emailContains: string (filtro por email do participante)
 * - palestraId: filtra participantes que têm presença nessa palestra
 *   (ajuste o nome do campo em presenca se for diferente)
 * - minFeedbacks, minVotos, minPresencas, minQuizScore: mínimos numéricos
 */
export async function getTudoService({
  nomeContains,
  emailContains,
  palestraId,
  minFeedbacks = 0,
  minVotos = 0,
  minPresencas = 0,
  minQuizScore = 0,
} = {}) {
  // 1) Monta filtro de participante (nome/email)
  const whereParticipante = {};

  if (nomeContains) {
    whereParticipante.nome = {
      contains: nomeContains,
      mode: 'insensitive',
    };
  }

  if (emailContains) {
    whereParticipante.email = {
      contains: emailContains,
      mode: 'insensitive',
    };
  }

  // 2) Busca participantes já filtrando por nome/email
  const participantes = await prisma.participante.findMany({
    where: whereParticipante,
  });

  const resultado = [];

  const existePergunta = await tabelaExiste('pergunta');
  const existeQuiz = await tabelaExiste('quiz');
  const existeTentativa = await tabelaExiste('tentativa');
  const existePresenca = await tabelaExiste('presenca');

  for (const p of participantes) {
    // 3) Monta filtro de presença (por palestra, se existir)
    let presencasWhere = { participanteId: p.id };

    if (palestraId) {
      // AJUSTE AQUI se o campo for outro (ex.: sessionId, eventoId etc.)
      presencasWhere = {
        ...presencasWhere,
        palestraId,
      };
    }

    // FEEDBACKS
    const feedbacks = await prisma.feedback.count({
      where: { participanteId: p.id },
    });

    // PRESENÇAS (com possível filtro por palestra)
    const presencas = existePresenca
      ? await prisma.presenca.count({
          where: presencasWhere,
        })
      : 0;

    // PERGUNTAS
    const perguntas = existePergunta
      ? await prisma.pergunta.count({ where: { participanteId: p.id } })
      : 0;

    // VOTOS (curtidas em Pergunta)
    const votos = existePergunta
      ? (await prisma.pergunta.aggregate({
          where: { participanteId: p.id },
          _sum: { curtidas: true },
        }))?._sum?.curtidas ?? 0
      : 0;

    // QUIZ SCORE (soma de pontosObtidos em todas as tentativas do participante)
    const scoreQuiz = existeTentativa
      ? (await prisma.tentativa.aggregate({
          where: { participanteId: p.id },
          _sum: { pontosObtidos: true },
        }))?._sum?.pontosObtidos ?? 0
      : 0;

    const item = {
      id: p.id,
      nome: p.nome,
      email: p.email,

      feedbacks,
      presencas,
      perguntas,
      votosPerguntas: votos,
      quizScore: scoreQuiz,

      scoreTotal: feedbacks + presencas + perguntas + votos + scoreQuiz,
    };

    // 4) Filtros numéricos finais
    if (
      item.feedbacks >= minFeedbacks &&
      item.votosPerguntas >= minVotos &&
      item.presencas >= minPresencas &&
      item.quizScore >= minQuizScore
    ) {
      resultado.push(item);
    }
  }

  return resultado;
}
