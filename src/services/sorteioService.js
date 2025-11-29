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

export async function getTudoService({
  minFeedbacks = 0,
  minVotos = 0,
  minPresencas = 0,
  minQuizScore = 0
} = {}) {

  const participantes = await prisma.participante.findMany();
  const resultado = [];

  const existePergunta = await tabelaExiste("pergunta");
  const existeQuiz = await tabelaExiste("quiz");

  for (const p of participantes) {

    // Sempre existem no seu banco
    const feedbacks = await prisma.feedback.count({
      where: { participanteId: p.id }
    });

    const presencas = await prisma.presenca.count({
      where: { participanteId: p.id }
    });

    // Só executa se a tabela existir
    const perguntas = existePergunta
      ? await prisma.pergunta.count({ where: { participanteId: p.id } })
      : 0;

    const votos = existePergunta
      ? (await prisma.pergunta.aggregate({
          where: { participanteId: p.id },
          _sum: { votos: true }
        }))?._sum?.votos ?? 0
      : 0;

    const scoreQuiz = existeQuiz
      ? (await prisma.quiz.aggregate({
          where: { participanteId: p.id },
          _sum: { score: true }
        }))?._sum?.score ?? 0
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

      scoreTotal:
        feedbacks +
        presencas +
        perguntas +
        votos +
        scoreQuiz
    };

    // filtros
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
