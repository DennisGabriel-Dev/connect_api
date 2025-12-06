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
        },
        curtidasPor: true
      },
      orderBy: [
        { curtidas: 'desc' },
        { criadoEm: 'asc' }
      ]
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
        },
        curtidasPor: true
      },
      orderBy: [
        { curtidas: 'desc' },
        { criadoEm: 'asc' }
      ]
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

// Curtir/Descurtir pergunta
export const toggleCurtida = async (req, res) => {
  try {
    const { perguntaId } = req.params;
    const { participanteId } = req.body;

    if (!participanteId) {
      return res.status(400).json({ error: "participanteId é obrigatório" });
    }

    // Verificar se a pergunta existe
    const pergunta = await prisma.pergunta.findUnique({
      where: { id: perguntaId }
    });

    if (!pergunta) {
      return res.status(404).json({ error: "Pergunta não encontrada" });
    }

    // Verificar se já curtiu
    const curtidaExistente = await prisma.curtida.findUnique({
      where: {
        participanteId_perguntaId: {
          participanteId,
          perguntaId
        }
      }
    });

    if (curtidaExistente) {
      // Descurtir - remover curtida
      await prisma.curtida.delete({
        where: {
          participanteId_perguntaId: {
            participanteId,
            perguntaId
          }
        }
      });

      // Decrementar contador
      const perguntaAtualizada = await prisma.pergunta.update({
        where: { id: perguntaId },
        data: {
          curtidas: {
            decrement: 1
          }
        },
        include: {
          curtidasPor: true
        }
      });

      return res.status(200).json({
        message: "Curtida removida",
        curtiu: false,
        pergunta: perguntaAtualizada
      });

    } else {
      // Verificar limite de 3 curtidas
      const totalCurtidas = await prisma.curtida.count({
        where: { participanteId }
      });

      if (totalCurtidas >= 3) {
        return res.status(400).json({ 
          error: "Limite de 3 curtidas atingido. Remova uma curtida para curtir outra pergunta." 
        });
      }

      // Curtir - adicionar curtida
      await prisma.curtida.create({
        data: {
          participanteId,
          perguntaId
        }
      });

      // Incrementar contador
      const perguntaAtualizada = await prisma.pergunta.update({
        where: { id: perguntaId },
        data: {
          curtidas: {
            increment: 1
          }
        },
        include: {
          curtidasPor: true
        }
      });

      return res.status(200).json({
        message: "Pergunta curtida",
        curtiu: true,
        pergunta: perguntaAtualizada
      });
    }

  } catch (error) {
    console.error("Erro ao curtir/descurtir pergunta:", error);
    return res.status(500).json({ error: "Erro ao processar curtida." });
  }
};

// Obter curtidas de um participante
export const obterCurtidasParticipante = async (req, res) => {
  try {
    const { participanteId } = req.params;

    const curtidas = await prisma.curtida.findMany({
      where: { participanteId },
      include: {
        pergunta: {
          include: {
            palestra: {
              select: {
                id: true,
                titulo: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({
      totalCurtidas: curtidas.length,
      curtidasRestantes: 3 - curtidas.length,
      curtidas
    });

  } catch (error) {
    console.error("Erro ao obter curtidas:", error);
    return res.status(500).json({ error: "Erro ao buscar curtidas." });
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
