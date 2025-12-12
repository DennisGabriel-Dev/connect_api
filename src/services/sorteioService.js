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
  tipoUsuario,
  turma,
  filtroPerguntas,
  incluirDetalhes = false, // Flag para incluir detalhes completos (só quando necessário)
} = {}) {
  try {
    console.log('🔍 Iniciando getTudoService com filtros:', { nomeContains, tipoUsuario, turma, filtroPerguntas });
    
    // 1) Monta filtro de participante (nome/email/tipo/turma)
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

    if (tipoUsuario) {
      whereParticipante.tipoUsuario = tipoUsuario;
    }

    if (turma && tipoUsuario === 'discente') {
      whereParticipante.turma = turma;
    }

    // 2) Busca participantes já filtrando por nome/email
    let participantes = [];
    try {
      participantes = await prisma.participante.findMany({
        where: whereParticipante,
        select: {
          id: true,
          nome: true,
          email: true,
          tipoUsuario: true,
          turma: true,
        },
      });
      console.log(`📊 Encontrados ${participantes.length} participantes`);
    } catch (error) {
      console.error('❌ Erro ao buscar participantes:', error);
      throw new Error(`Erro ao buscar participantes: ${error.message}`);
    }

    if (participantes.length === 0) {
      console.log('⚠️ Nenhum participante encontrado');
      return [];
    }

    const participanteIds = participantes.map(p => p.id);
    const resultado = [];

    const existePergunta = await tabelaExiste('pergunta');
    const existeQuiz = await tabelaExiste('quiz');
    const existeTentativa = await tabelaExiste('tentativa');
    const existePresenca = await tabelaExiste('presenca');
    const existeFeedback = await tabelaExiste('feedback');

    // 3) OTIMIZAÇÃO: Buscar todos os dados de uma vez e processar em memória
    // Isso funciona melhor com MongoDB que pode ter limitações com groupBy
    
    // Buscar todos os dados relacionados em paralelo
    console.log('📥 Buscando dados relacionados...');
    let feedbacksData = [];
    let presencasData = [];
    let perguntasData = [];
    let tentativasData = [];

    try {
      // Buscar apenas dados dos participantes filtrados para melhor performance
      const whereFeedback = participanteIds.length > 0 ? { participanteId: { in: participanteIds } } : {};
      const wherePresenca = palestraId 
        ? { palestraId, participanteId: { in: participanteIds } }
        : participanteIds.length > 0 
        ? { participanteId: { in: participanteIds } }
        : {};
      const wherePergunta = participanteIds.length > 0 ? { participanteId: { in: participanteIds } } : {};
      const whereTentativa = participanteIds.length > 0 ? { participanteId: { in: participanteIds } } : {};

      [feedbacksData, presencasData, perguntasData, tentativasData] = await Promise.all([
        existeFeedback
          ? prisma.feedback.findMany({
              where: whereFeedback,
              select: { participanteId: true },
            }).catch((err) => {
              console.error('⚠️ Erro ao buscar feedbacks:', err.message);
              return [];
            })
          : Promise.resolve([]),
        existePresenca
          ? prisma.presenca.findMany({
              where: wherePresenca,
              select: { participanteId: true },
            }).catch((err) => {
              console.error('⚠️ Erro ao buscar presenças:', err.message);
              return [];
            })
          : Promise.resolve([]),
        existePergunta
          ? prisma.pergunta.findMany({
              where: wherePergunta,
              select: { participanteId: true, status: true, curtidas: true },
            }).catch((err) => {
              console.error('⚠️ Erro ao buscar perguntas:', err.message);
              return [];
            })
          : Promise.resolve([]),
        existeTentativa
          ? prisma.tentativa.findMany({
              where: whereTentativa,
              select: { participanteId: true, pontosObtidos: true },
            }).catch((err) => {
              console.error('⚠️ Erro ao buscar tentativas:', err.message);
              return [];
            })
          : Promise.resolve([]),
      ]);
      console.log(`✅ Dados carregados: ${feedbacksData.length} feedbacks, ${presencasData.length} presenças, ${perguntasData.length} perguntas, ${tentativasData.length} tentativas`);
    } catch (error) {
      console.error('❌ Erro ao buscar dados relacionados:', error);
      throw new Error(`Erro ao buscar dados relacionados: ${error.message}`);
    }

    // Processar dados em memória para criar maps
    const feedbacksMap = new Map();
    feedbacksData.forEach(f => {
      feedbacksMap.set(f.participanteId, (feedbacksMap.get(f.participanteId) || 0) + 1);
    });

    const presencasMap = new Map();
    presencasData.forEach(p => {
      presencasMap.set(p.participanteId, (presencasMap.get(p.participanteId) || 0) + 1);
    });

    const perguntasMap = new Map();
    const perguntasPremiadasMap = new Map();
    const votosMap = new Map();
    
    perguntasData.forEach(p => {
      const pid = p.participanteId;
      // Contar total de perguntas
      perguntasMap.set(pid, (perguntasMap.get(pid) || 0) + 1);
      
      // Contar perguntas premiadas
      if (p.status === 'premiada') {
        perguntasPremiadasMap.set(pid, (perguntasPremiadasMap.get(pid) || 0) + 1);
      }
      
      // Somar votos (curtidas)
      votosMap.set(pid, (votosMap.get(pid) || 0) + (p.curtidas || 0));
    });

    const quizScoreMap = new Map();
    tentativasData.forEach(t => {
      quizScoreMap.set(t.participanteId, (quizScoreMap.get(t.participanteId) || 0) + (t.pontosObtidos || 0));
    });

    // 4) Processar cada participante usando os maps
    for (const p of participantes) {
      const feedbacks = feedbacksMap.get(p.id) || 0;
      const presencas = presencasMap.get(p.id) || 0;
      const perguntas = perguntasMap.get(p.id) || 0;
      const perguntasPremiadas = perguntasPremiadasMap.get(p.id) || 0;
      const votos = votosMap.get(p.id) || 0;
      const quizScore = quizScoreMap.get(p.id) || 0;

      // Aplicar filtro de perguntas
      if (existePergunta && filtroPerguntas && filtroPerguntas !== 'todas') {
        // Filtro "premiadas": mostrar apenas usuários que têm pelo menos uma pergunta premiada
        if (filtroPerguntas === 'premiadas' && perguntasPremiadas === 0) {
          continue;
        }
        // Filtro "nao_premiadas": mostrar apenas usuários que NÃO têm nenhuma pergunta premiada
        // (ou seja, excluir quem tem perguntasPremiadas > 0)
        if (filtroPerguntas === 'nao_premiadas' && perguntasPremiadas > 0) {
          continue;
        }
      }

      // Aplicar filtros numéricos
      if (
        feedbacks < minFeedbacks ||
        votos < minVotos ||
        presencas < minPresencas ||
        quizScore < minQuizScore
      ) {
        continue;
      }

      const item = {
        id: p.id,
        nome: p.nome,
        email: p.email,
        tipoUsuario: p.tipoUsuario,
        turma: p.turma,
        feedbacks,
        presencas,
        perguntas,
        perguntasPremiadas,
        votosPerguntas: votos,
        quizScore,
        scoreTotal: feedbacks + presencas + perguntas + votos + quizScore,
      };

      // Buscar detalhes completos apenas se solicitado (para tela de detalhes)
      if (incluirDetalhes) {
        item.detalhes = await buscarDetalhesCompletos(p.id, existePergunta, existePresenca, existeTentativa);
      }

      resultado.push(item);
    }

    console.log(`✅ Processamento concluído: ${resultado.length} usuários no resultado final`);
    return resultado;
  } catch (error) {
    console.error('❌ Erro crítico em getTudoService:', error);
    console.error('Stack:', error.stack);
    throw error;
  }
}

// Função para buscar detalhes completos de um usuário específico
export async function getDetalhesUsuarioService(participanteId) {
  const existePergunta = await tabelaExiste('pergunta');
  const existeQuiz = await tabelaExiste('quiz');
  const existeTentativa = await tabelaExiste('tentativa');
  const existePresenca = await tabelaExiste('presenca');

  // Buscar participante
  const participante = await prisma.participante.findUnique({
    where: { id: participanteId },
    select: {
      id: true,
      nome: true,
      email: true,
      tipoUsuario: true,
      turma: true,
    },
  });

  if (!participante) {
    throw new Error('Participante não encontrado');
  }

  const detalhes = await buscarDetalhesCompletos(participanteId, existePergunta, existePresenca, existeTentativa);

  // Buscar contagens
  let existeFeedback = await tabelaExiste('feedback');
  const feedbacks = existeFeedback
    ? await prisma.feedback.count({ where: { participanteId } })
    : 0;
  const presencas = existePresenca
    ? await prisma.presenca.count({ where: { participanteId } })
    : 0;
  const perguntas = existePergunta
    ? await prisma.pergunta.count({ where: { participanteId } })
    : 0;
  const perguntasPremiadas = existePergunta
    ? await prisma.pergunta.count({ where: { participanteId, status: 'premiada' } })
    : 0;
  const votos = existePergunta
    ? (await prisma.pergunta.aggregate({
        where: { participanteId },
        _sum: { curtidas: true },
      }))?._sum?.curtidas ?? 0
    : 0;
  const quizScore = existeTentativa
    ? (await prisma.tentativa.aggregate({
        where: { participanteId },
        _sum: { pontosObtidos: true },
      }))?._sum?.pontosObtidos ?? 0
    : 0;

  return {
    ...participante,
    feedbacks,
    presencas,
    perguntas,
    perguntasPremiadas,
    votosPerguntas: votos,
    quizScore,
    scoreTotal: feedbacks + presencas + perguntas + votos + quizScore,
    detalhes,
  };
}

// Função separada para buscar detalhes completos (só quando necessário)
async function buscarDetalhesCompletos(participanteId, existePergunta, existePresenca, existeTentativa) {
  const detalhes = {};

  // Buscar detalhes em paralelo
  let existeFeedback = await tabelaExiste('feedback');
  const [feedbacksList, perguntasList, presencasList, tentativasList] = await Promise.all([
    existeFeedback
      ? prisma.feedback.findMany({
          where: { participanteId },
          include: {
            palestra: {
              select: { id: true, titulo: true },
            },
          },
          orderBy: { id: 'desc' },
        })
      : Promise.resolve([]),
    existePergunta
      ? prisma.pergunta.findMany({
          where: { participanteId },
          include: {
            palestra: {
              select: { id: true, titulo: true },
            },
          },
          orderBy: { dataHora: 'desc' },
        })
      : Promise.resolve([]),
    existePresenca
      ? prisma.presenca.findMany({
          where: { participanteId },
          include: {
            palestra: {
              select: { id: true, titulo: true },
            },
          },
          orderBy: { dataHora: 'desc' },
        })
      : Promise.resolve([]),
    existeTentativa
      ? prisma.tentativa.findMany({
          where: { participanteId },
          include: {
            quiz: {
              select: {
                id: true,
                titulo: true,
                palestra: {
                  select: { id: true, titulo: true },
                },
              },
            },
          },
          orderBy: { enviadoEm: 'desc' },
        })
      : Promise.resolve([]),
  ]);

  detalhes.feedbacksList = feedbacksList.map((f) => ({
    comentario: f.comentario,
    estrelas: f.estrelas,
    palestraTitulo: f.palestra?.titulo || 'Palestra não encontrada',
  }));

  detalhes.perguntasList = perguntasList.map((perg) => ({
    texto: perg.texto,
    votos: perg.curtidas,
    status: perg.status,
    palestraTitulo: perg.palestra?.titulo || 'Palestra não encontrada',
  }));

  detalhes.presencasList = presencasList.map((pres) => ({
    palestraTitulo: pres.palestra?.titulo || 'Palestra não encontrada',
    dataHora: pres.dataHora,
  }));

  detalhes.quizzesList = tentativasList.map((t) => ({
    score: t.pontosObtidos,
    pontosObtidos: t.pontosObtidos,
    quizTitulo: t.quiz?.titulo || 'Quiz não encontrado',
    palestraTitulo: t.quiz?.palestra?.titulo || 'Palestra não encontrada',
  }));

  return detalhes;
}
