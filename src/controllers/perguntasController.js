import prisma from '../lib/prisma.js';

// Listar perguntas de uma palestra (apenas aprovadas para usuários comuns)
export const listarPerguntasPorPalestra = async (req, res) => {
  try {
    const { palestraId } = req.params;
    const { status } = req.query;

    if (!palestraId) {
      return res.status(400).json({ error: "palestraId é obrigatório" });
    }

    const whereClause = { palestraId };

    // Se status não for especificado, mostra apenas aprovadas para usuários
    if (status) {
      whereClause.status = status;
    } else {
      whereClause.status = "aprovada";
    }

    const perguntas = await prisma.pergunta.findMany({
      where: whereClause,
      include: {
        participante: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: {
        criadoEm: 'asc'
      }
    });

    return res.status(200).json(perguntas);

  } catch (error) {
    console.error("Erro ao listar perguntas:", error);
    return res.status(500).json({ error: "Erro ao buscar perguntas." });
  }
};

// Listar todas as perguntas (com filtros por status) - Admin
export const listarTodasPerguntas = async (req, res) => {
  try {
    const { palestraId, status } = req.query;

    const whereClause = {};

    if (palestraId) {
      whereClause.palestraId = palestraId;
    }

    if (status) {
      whereClause.status = status;
    }

    const perguntas = await prisma.pergunta.findMany({
      where: whereClause,
      include: {
        participante: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        palestra: {
          select: {
            id: true,
            titulo: true
          }
        }
      },
      orderBy: {
        criadoEm: 'asc'
      }
    });

    return res.status(200).json(perguntas);

  } catch (error) {
    console.error("Erro ao listar todas as perguntas:", error);
    return res.status(500).json({ error: "Erro ao buscar perguntas." });
  }
};

// Criar nova pergunta
export const criarPergunta = async (req, res) => {
  try {
    const { texto, participanteId, palestraId } = req.body;

    if (!texto || !participanteId || !palestraId) {
      return res.status(400).json({ 
        error: "texto, participanteId e palestraId são obrigatórios" 
      });
    }

    // Verificar se a palestra existe
    const palestra = await prisma.palestra.findUnique({
      where: { id: palestraId }
    });

    if (!palestra) {
      return res.status(404).json({ error: "Palestra não encontrada" });
    }

    // Verificar se o participante existe
    const participante = await prisma.participante.findUnique({
      where: { id: participanteId }
    });

    if (!participante) {
      return res.status(404).json({ error: "Participante não encontrado" });
    }

    const novaPergunta = await prisma.pergunta.create({
      data: {
        texto,
        participanteId,
        palestraId,
        status: "pendente" // Inicia como pendente
      },
      include: {
        participante: {
          select: {
            id: true,
            nome: true
          }
        },
        palestra: {
          select: {
            id: true,
            titulo: true
          }
        }
      }
    });

    return res.status(201).json(novaPergunta);

  } catch (error) {
    console.error("Erro ao criar pergunta:", error);
    return res.status(500).json({ error: "Erro ao criar pergunta." });
  }
};

// Aprovar pergunta - Admin
export const aprovarPergunta = async (req, res) => {
  try {
    const { id } = req.params;

    const pergunta = await prisma.pergunta.findUnique({
      where: { id }
    });

    if (!pergunta) {
      return res.status(404).json({ error: "Pergunta não encontrada" });
    }

    const perguntaAtualizada = await prisma.pergunta.update({
      where: { id },
      data: { status: "aprovada" },
      include: {
        participante: {
          select: {
            id: true,
            nome: true
          }
        },
        palestra: {
          select: {
            id: true,
            titulo: true
          }
        }
      }
    });

    return res.status(200).json(perguntaAtualizada);

  } catch (error) {
    console.error("Erro ao aprovar pergunta:", error);
    return res.status(500).json({ error: "Erro ao aprovar pergunta." });
  }
};

// Rejeitar pergunta - Admin
export const rejeitarPergunta = async (req, res) => {
  try {
    const { id } = req.params;

    const pergunta = await prisma.pergunta.findUnique({
      where: { id }
    });

    if (!pergunta) {
      return res.status(404).json({ error: "Pergunta não encontrada" });
    }

    const perguntaAtualizada = await prisma.pergunta.update({
      where: { id },
      data: { status: "rejeitada" },
      include: {
        participante: {
          select: {
            id: true,
            nome: true
          }
        },
        palestra: {
          select: {
            id: true,
            titulo: true
          }
        }
      }
    });

    return res.status(200).json(perguntaAtualizada);

  } catch (error) {
    console.error("Erro ao rejeitar pergunta:", error);
    return res.status(500).json({ error: "Erro ao rejeitar pergunta." });
  }
};

// Deletar pergunta - Admin ou autor
export const deletarPergunta = async (req, res) => {
  try {
    const { id } = req.params;
    const { participanteId } = req.body;

    const pergunta = await prisma.pergunta.findUnique({
      where: { id }
    });

    if (!pergunta) {
      return res.status(404).json({ error: "Pergunta não encontrada" });
    }

    // Verificar se é o autor
    if (pergunta.participanteId !== participanteId) {
      // Verificar se é admin
      const participante = await prisma.participante.findUnique({
        where: { id: participanteId }
      });

      if (!participante || participante.role !== 'admin') {
        return res.status(403).json({ 
          error: "Sem permissão para deletar esta pergunta" 
        });
      }
    }

    await prisma.pergunta.delete({
      where: { id }
    });

    return res.status(200).json({ message: "Pergunta deletada com sucesso" });

  } catch (error) {
    console.error("Erro ao deletar pergunta:", error);
    return res.status(500).json({ error: "Erro ao deletar pergunta." });
  }
};
