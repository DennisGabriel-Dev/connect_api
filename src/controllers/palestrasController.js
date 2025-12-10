import prisma from '../lib/prisma.js';


export const listar = async (req, res) => {
  try {

    const { tipo } = req.query;

    const whereClause = {};

    // Se o filtro vier preenchido, adiciona na busca
    if (tipo) {
      whereClause.tipo = tipo;
    }

    const palestras = await prisma.palestra.findMany({
      where: whereClause,
    });

    return res.status(200).json(palestras);

  } catch (error) {
    console.error("Erro ao listar palestras:", error);
    return res.status(500).json({ error: "Erro ao buscar a lista de palestras." });
  }
};

// Endpoint: Listar palestras vinculadas a um participante (através das presenças)
export const listarPalestrasPorParticipante = async (req, res) => {
  try {
    const { participanteId } = req.params;

    if (!participanteId) {
      return res.status(400).json({ error: "participanteId é obrigatório" });
    }

    // Buscar todas as presenças do participante com os dados completos da palestra
    const presencas = await prisma.presenca.findMany({
      where: { participanteId },
      include: {
        palestra: {
          select: {
            id: true,
            titulo: true,
            descricao: true,
            tipo: true,
            local: true,
            horarios: true,
            palestrantes: true
          }
        }
      },
      orderBy: {
        dataHora: 'desc'
      }
    });

    // Extrair apenas as palestras (com informações da presença)
    const palestrasComPresenca = presencas
      .filter(p => p.palestra) // Filtrar presenças sem palestra
      .map(p => ({
        ...p.palestra,
        dataHoraPresenca: p.dataHora,
        sincronizado: p.sincronizado
      }));

    return res.status(200).json(palestrasComPresenca);

  } catch (error) {
    console.error("Erro ao listar palestras do participante:", error);
    return res.status(500).json({ error: "Erro ao buscar palestras do participante." });
  }
};

// Endpoint: Buscar quiz vinculado à palestra
export const obterQuizDaPalestra = async (req, res) => {
  try {
    const { id } = req.params;

    const participanteId = req.headers['x-participante-id'];

    if (!id) {
      return res.status(400).json({ error: 'palestraId é obrigatório' });
    }

    const quiz = await prisma.quiz.findFirst({
      where: { palestraId: id },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado para esta palestra.' });
    }

    let jaRespondeu = false;
    let presencaConfirmada = false;

    if (participanteId) {
      const tentativa = await prisma.tentativa.findUnique({
        where: {
          participanteId_quizId: {
            participanteId: participanteId,
            quizId: quiz.id
          }
        }
      });
      jaRespondeu = !!tentativa;

      const presenca = await prisma.presenca.findUnique({
        where: {
          participanteId_palestraId: {
            participanteId: participanteId,
            palestraId: id
          }
        }
      })
      presencaConfirmada = !!presenca;

    }

    return res.status(200).json({ ...quiz, jaRespondeu: jaRespondeu, presencaConfirmada: presencaConfirmada });
  } catch (error) {
    console.error('Erro ao buscar quiz da palestra:', error);
    return res.status(500).json({ error: 'Erro ao buscar quiz da palestra.' });
  }
};

// PATCH /api/v1/palestras/:id/periodo-votacao - Configurar período de votação (Admin)
export const configurarPeriodoVotacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { votacaoInicio, votacaoFim } = req.body;

    if (!votacaoInicio || !votacaoFim) {
      return res.status(400).json({
        error: 'votacaoInicio e votacaoFim são obrigatórios'
      });
    }

    const inicio = new Date(votacaoInicio);
    const fim = new Date(votacaoFim);

    // Validar que fim é após início
    if (fim <= inicio) {
      return res.status(400).json({
        error: 'A data de fim deve ser posterior à data de início'
      });
    }

    const palestra = await prisma.palestra.update({
      where: { id },
      data: {
        votacaoInicio: inicio,
        votacaoFim: fim
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Período de votação configurado com sucesso',
      data: {
        id: palestra.id,
        titulo: palestra.titulo,
        votacaoInicio: palestra.votacaoInicio,
        votacaoFim: palestra.votacaoFim
      }
    });
  } catch (error) {
    console.error('Erro ao configurar período de votação:', error);
    return res.status(500).json({ error: 'Erro ao configurar período de votação.' });
  }
};

// GET /api/v1/palestras/:id/periodo-votacao - Buscar período de votação
export const obterPeriodoVotacao = async (req, res) => {
  try {
    const { id } = req.params;

    const palestra = await prisma.palestra.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        votacaoInicio: true,
        votacaoFim: true,
        horarios: true
      }
    });

    if (!palestra) {
      return res.status(404).json({ error: 'Palestra não encontrada' });
    }

    // Calcular período efetivo (configurado ou padrão)
    const { verificarPeriodoAtivo } = await import('../utils/periodoVotacao.js');
    const periodoStatus = verificarPeriodoAtivo(palestra);

    return res.status(200).json({
      success: true,
      data: {
        palestraId: palestra.id,
        palestraTitulo: palestra.titulo,
        votacaoInicio: palestra.votacaoInicio,
        votacaoFim: palestra.votacaoFim,
        periodoAtivo: periodoStatus.ativo,
        periodoEfetivo: periodoStatus.periodo,
        usandoPadrao: periodoStatus.periodo?.isPadrao || false,
        motivo: periodoStatus.motivo
      }
    });
  } catch (error) {
    console.error('Erro ao buscar período de votação:', error);
    return res.status(500).json({ error: 'Erro ao buscar período de votação.' });
  }
};