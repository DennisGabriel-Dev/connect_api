import prisma from '../lib/prisma.js';

export const registrarPresenca = async (req, res) => {
  try {
    const { participanteId, palestraId } = req.body;

    // 1. Validar dados obrigatórios
    if (!participanteId || !palestraId) {
      return res.status(400).json({ 
        error: "participanteId e palestraId são obrigatórios" 
      });
    }

    // 2. Verificar se o participante existe
    const participante = await prisma.participante.findUnique({
      where: { id: participanteId }
    });

    if (!participante) {
      return res.status(404).json({ error: "Participante não encontrado" });
    }

    // 3. Verificar se a palestra existe
    const palestra = await prisma.palestra.findUnique({
      where: { id: palestraId }
    });

    if (!palestra) {
      return res.status(404).json({ error: "Palestra não encontrada" });
    }

    // 4. Registrar presença (upsert para evitar duplicatas)
    const presenca = await prisma.presenca.upsert({
      where: {
        participanteId_palestraId: {
          participanteId,
          palestraId
        }
      },
      update: {
        dataHora: new Date()
      },
      create: {
        participanteId,
        palestraId,
        dataHora: new Date(),
        sincronizado: false
      }
    });

    return res.status(201).json({
      message: "Presença registrada com sucesso",
      presenca
    });

  } catch (error) {
    console.error("Erro ao registrar presença:", error);
    return res.status(500).json({ error: "Erro ao registrar presença" });
  }
};

// Endpoint: Listar presenças de um participante
export const listarPresencas = async (req, res) => {
  try {
    const { participanteId } = req.params;

    const presencas = await prisma.presenca.findMany({
      where: { participanteId }
    });

    return res.status(200).json(presencas);

  } catch (error) {
    console.error("Erro ao listar presenças:", error);
    return res.status(500).json({ error: "Erro ao listar presenças" });
  }
};

// Endpoint: Registrar presença via QR Code (GET para facilitar testes)
// GET /api/v1/presenca/qr?participanteId=XXX&palestraId=YYY
export const registrarPresencaViaQr = async (req, res) => {
  try {
    const { participanteId, palestraId } = req.query;

    // Validar dados obrigatórios
    if (!participanteId || !palestraId) {
      return res.status(400).json({ 
        error: "participanteId e palestraId são obrigatórios" 
      });
    }

    // Reutilizar a lógica do registrarPresenca
    const participante = await prisma.participante.findUnique({
      where: { id: participanteId }
    });

    if (!participante) {
      return res.status(404).json({ error: "Participante não encontrado" });
    }

    const palestra = await prisma.palestra.findUnique({
      where: { id: palestraId }
    });

    if (!palestra) {
      return res.status(404).json({ error: "Palestra não encontrada" });
    }

    const presenca = await prisma.presenca.upsert({
      where: {
        participanteId_palestraId: {
          participanteId,
          palestraId
        }
      },
      update: {
        dataHora: new Date()
      },
      create: {
        participanteId,
        palestraId,
        dataHora: new Date(),
        sincronizado: false
      }
    });

    return res.status(201).json({
      message: "Presença registrada com sucesso",
      presenca
    });

  } catch (error) {
    console.error("Erro ao registrar presença via QR:", error);
    return res.status(500).json({ error: "Erro ao registrar presença" });
  }
};
