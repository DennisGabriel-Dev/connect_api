import prisma from "../lib/prisma.js";

export const criarFeedback = async (req, res) => {
  try {
    const { participanteId, palestraId, estrelas, comentario } = req.body;

    if (!participanteId || !palestraId || !estrelas) {
      return res.status(400).json({ error: "Campos obrigatórios: participanteId, palestraId e estrelas." });
    }

    if (estrelas < 1 || estrelas > 5) {
      return res.status(400).json({ error: "Estrelas deve ser entre 1 e 5." });
    }

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
        comentario: comentario || null
      }
    });

    return res.status(201).json({ 
      message: "Feedback enviado com sucesso!", 
      feedback 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar feedback." });
  }
};

// Listar feedbacks de uma palestra
export const listarFeedbacksDaPalestra = async (req, res) => {
  try {
    const { palestraId } = req.params;
    
    console.log('🔍 Buscando feedbacks para palestraId:', palestraId);

    const feedbacks = await prisma.feedback.findMany({
      where: { palestraId },
      include: {
        participante: {
          select: { nome: true, email: true }
        }
      }
    });

    console.log('Feedbacks encontrados:', feedbacks.length);
    
    return res.status(200).json(feedbacks);

  } catch (error) {
    console.error("Erro detalhado ao buscar feedbacks:", error);
    return res.status(500).json({ 
      error: "Erro ao buscar feedbacks.",
      details: error.message 
    });
  }
};

// FEEDBACKS DO USUÁRIO LOGADO
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