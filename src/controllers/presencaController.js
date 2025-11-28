import prisma from '../lib/prisma.js';
import { registrarPresencaEven3 } from '../services/syncEven3.js';

export const registrarPresenca = async (req, res) => {
  try {
    const { participanteId, palestraId } = req.body;

    // 1. Validar dados obrigatórios
    if (!participanteId || !palestraId) {
      return res.status(400).json({ 
        error: "participanteId e palestraId são obrigatórios" 
      });
    }

    // 2. Buscar participante
    const participante = await prisma.participante.findUnique({
      where: { id: participanteId }
    });

    if (!participante) {
      return res.status(404).json({ 
        error: "Participante não encontrado. Faça login novamente." 
      });
    }

    // 3. Buscar palestra/atividade
    const palestra = await prisma.palestra.findUnique({
      where: { id: palestraId }
    });

    if (!palestra) {
      return res.status(404).json({ error: "Palestra/Atividade não encontrada" });
    }

    // 4. Registrar presença local primeiro
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

    // 5. Tentar check-in no Even3 
    console.log('Sincronizando presença com Even3...');
    const resultadoEven3 = await registrarPresencaEven3(
      participante.even3Id, 
      palestra.even3Id,
      palestra.tipo
    );
    console.log('Resultado Even3:', resultadoEven3);

    // 6. Se Even3 rejeitou por falta de inscrição, deletar presença local
    if (resultadoEven3.erro === 'NAO_INSCRITO') {
      await prisma.presenca.delete({
        where: { id: presenca.id }
      });

      return res.status(403).json({ 
        error: `Participante não está inscrito neste ${palestra.tipo}`,
        tipo: palestra.tipo,
        titulo: palestra.titulo
      });
    }

    // 7. Atualizar flag de sincronização se sucesso
    if (resultadoEven3.sucesso) {
      await prisma.presenca.update({
        where: { id: presenca.id },
        data: { sincronizado: true }
      });
    }

    return res.status(201).json({
      message: "Presença registrada com sucesso",
      presenca: {
        ...presenca,
        sincronizado: resultadoEven3.sucesso
      },
      participante: {
        nome: participante.nome,
        email: participante.email
      },
      atividade: {
        titulo: palestra.titulo,
        tipo: palestra.tipo
      }
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
