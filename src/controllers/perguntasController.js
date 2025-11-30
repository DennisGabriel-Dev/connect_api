import prisma from '../lib/prisma.js';

// Criar uma nova pergunta
export const criarPergunta = async (req, res) => {
  try {
    const { texto, participanteId, participanteNome, palestraId, palestraTitulo } = req.body;

    // Validação básica
    if (!texto || !participanteId || !participanteNome || !palestraId || !palestraTitulo) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios: texto, participanteId, participanteNome, palestraId, palestraTitulo'
      });
    }

    // Criar a pergunta (sem validar se participante/palestra existem)
    const pergunta = await prisma.pergunta.create({
      data: {
        texto,
        participanteId,
        participanteNome,
        palestraId,
        palestraTitulo
      }
    });

    res.status(201).json({
      success: true,
      message: 'Pergunta criada com sucesso',
      data: pergunta
    });
  } catch (error) {
    console.error('Erro ao criar pergunta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar pergunta',
      error: error.message
    });
  }
};

// Listar todas as perguntas de uma palestra
export const listarPerguntasPorPalestra = async (req, res) => {
  try {
    const { palestraId } = req.params;
    const { respondidas } = req.query; // Filtro opcional: true, false, ou undefined (todas)

    const filtro = { palestraId };

    // Adicionar filtro de perguntas respondidas se especificado
    if (respondidas !== undefined) {
      filtro.respondida = respondidas === 'true';
    }

    const perguntas = await prisma.pergunta.findMany({
      where: filtro,
      orderBy: [
        { curtidas: 'desc' }, // Mais curtidas primeiro
        { dataHora: 'desc' }  // Mais recentes primeiro
      ]
    });

    res.status(200).json({
      success: true,
      count: perguntas.length,
      data: perguntas
    });
  } catch (error) {
    console.error('Erro ao listar perguntas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar perguntas',
      error: error.message
    });
  }
};

// Listar todas as perguntas de um participante
export const listarPerguntasPorParticipante = async (req, res) => {
  try {
    const { participanteId } = req.params;

    const perguntas = await prisma.pergunta.findMany({
      where: { participanteId },
      orderBy: { dataHora: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: perguntas.length,
      data: perguntas
    });
  } catch (error) {
    console.error('Erro ao listar perguntas do participante:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar perguntas do participante',
      error: error.message
    });
  }
};

// Responder uma pergunta
export const responderPergunta = async (req, res) => {
  try {
    const { id } = req.params;
    const { resposta, palestranteNome } = req.body;

    if (!resposta || !palestranteNome) {
      return res.status(400).json({
        success: false,
        message: 'Resposta e nome do palestrante são obrigatórios'
      });
    }

    // Verificar se a pergunta existe
    const perguntaExistente = await prisma.pergunta.findUnique({
      where: { id }
    });

    if (!perguntaExistente) {
      return res.status(404).json({
        success: false,
        message: 'Pergunta não encontrada'
      });
    }

    // Atualizar a pergunta com a resposta
    const pergunta = await prisma.pergunta.update({
      where: { id },
      data: {
        resposta,
        palestranteNome,
        respondida: true,
        dataResposta: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Pergunta respondida com sucesso',
      data: pergunta
    });
  } catch (error) {
    console.error('Erro ao responder pergunta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao responder pergunta',
      error: error.message
    });
  }
};

// Curtir uma pergunta
export const curtirPergunta = async (req, res) => {
  try {
    const { id } = req.params;

    // Incrementar o contador de curtidas diretamente
    const pergunta = await prisma.pergunta.update({
      where: { id },
      data: {
        curtidas: { increment: 1 }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Pergunta curtida com sucesso',
      data: pergunta
    });
  } catch (error) {
    console.error('Erro ao curtir pergunta:', error);
    
    // Se a pergunta não existir, retorna erro específico
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Pergunta não encontrada'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao curtir pergunta',
      error: error.message
    });
  }
};

// Deletar uma pergunta
export const deletarPergunta = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a pergunta existe
    const perguntaExistente = await prisma.pergunta.findUnique({
      where: { id }
    });

    if (!perguntaExistente) {
      return res.status(404).json({
        success: false,
        message: 'Pergunta não encontrada'
      });
    }

    // Deletar a pergunta
    await prisma.pergunta.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Pergunta deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar pergunta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar pergunta',
      error: error.message
    });
  }
};

// Obter uma pergunta específica
export const obterPergunta = async (req, res) => {
  try {
    const { id } = req.params;

    const pergunta = await prisma.pergunta.findUnique({
      where: { id }
    });

    if (!pergunta) {
      return res.status(404).json({
        success: false,
        message: 'Pergunta não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: pergunta
    });
  } catch (error) {
    console.error('Erro ao obter pergunta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter pergunta',
      error: error.message
    });
  }
};
