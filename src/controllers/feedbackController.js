import prisma from "../lib/prisma.js";

export const criarFeedback = async (req, res) => {
  try {
    const { participanteId, palestraId, estrelas, comentario } = req.body;

    if (!participanteId || !palestraId || !estrelas) {
      return res.status(400).json({ error: "Campos obrigatórios: participanteId, palestraId e estrelas." });
    }

    // Impede duplicação (já existe no schema, mas tratamos o erro também)
    const existente = await prisma.feedback.findUnique({
      where: {
        participanteId_palestraId: {
          participanteId,
          palestraId
        }
      }
    });

    if (existente) {
      return res.status(400).json({ error: "Você já enviou um feedback para esta palestra." });
    }

    const feedback = await prisma.feedback.create({
      data: {
        participanteId,
        palestraId,
        estrelas,
        comentario
      }
    });

    return res.status(201).json({ message: "Feedback enviado com sucesso!", feedback });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar feedback." });
  }
};


// Listar feedbacks de uma palestra
export const listarFeedbacksDaPalestra = async (req, res) => {
  try {
    const { palestraId } = req.params;

    const feedbacks = await prisma.feedback.findMany({
      where: { palestraId },
      include: {
        participante: {
          select: { nome: true, email: true }
        }
      }
    });

    return res.status(200).json(feedbacks);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar feedbacks." });
  }
};


// Feedbacks do usuário logado
export const listarFeedbacksDoUsuario = async (req, res) => {
  try {
    const { participanteId } = req.params;

    const feedbacks = await prisma.feedback.findMany({
      where: { participanteId },
      include: {
        palestra: {
          select: { titulo: true, descricao: true }
        }
      }
    });

    return res.status(200).json(feedbacks);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar feedbacks do usuário." });
  }
};
