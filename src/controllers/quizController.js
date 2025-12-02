import * as quizService from '../services/quizService.js'

export const listarTodos = async (req, res) => {
  try {
    const quizzes = await quizService.listarQuizzes()
    return res.json(quizzes)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar quizzes' })
  }
}

export const listarLiberados = async (req, res) => {
  try {
    const quizzesLiberados = await quizService.listarQuizzesLiberados()
    return res.json(quizzesLiberados)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar quizzes' })
  }
}

export const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params
    const participanteId = req.user?.id ?? req.headers['x-participante-id']

    if (!participanteId) {
      return res.status(401).json({ error: 'Usuário não autenticado. Faça login para responder o quiz.' })
    }

    const quiz = await quizService.buscarQuizPorId(id, participanteId)

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado' })
    }

    if (!quiz.liberado) {
      return res.status(403).json({ error: 'Este quiz ainda não está liberado.' })
    }

    return res.json(quiz)
  } catch (error) {

    if (error.message === 'Você já respondeu a este quiz.') {
       return res.status(403).json({ error: error.message })
    }

    console.error(error)
    return res.status(500).json({ error: 'Erro ao buscar quiz' })
  }
}

export const responder = async (req, res) => {
  try {
    const { id: quizId } = req.params
    const { respostas } = req.body

    // usuário autenticado pode estar disponível via middleware; se não, considerar public
    const participanteId = req.user?.id ?? req.headers['x-participante-id']

    if (!participanteId) {
      return res.status(401).json({ error: 'Usuário não autenticado. Faça login para responder o quiz.' })
    }
    
    const respostasNormalizadas = (respostas || []).map(r => ({ perguntaId: r.perguntaId, opcaoId: r.opcaoId }))

    const resultado = await quizService.responderQuiz(quizId, participanteId, respostasNormalizadas)

    return res.status(200).json({
      mensagem: `Quiz finalizado! Você obteve ${resultado.tentativa.pontosObtidos} de ${resultado.pontuacaoMaxima} pontos.`,
      resultado,
    })
  } catch (error) {
    if (error.message && error.message.includes('já respondeu')) {
      return res.status(400).json({ error: error.message })
    }
    console.error(error)
    return res.status(500).json({ error: 'Erro ao processar respostas.', detalhes: error.message })
  }
}

export const criarQuiz = async (req, res) => {
  const { titulo, palestraId, perguntas } = req.body;

  // Validação básica de entrada
  if (!titulo || !palestraId || !perguntas || !Array.isArray(perguntas) || perguntas.length === 0) {
    return res.status(400).json({ message: 'Título, palestraId e ao menos uma pergunta são obrigatórios.' });
  }

  try {
    const novoQuiz = await quizService.criarQuiz(req.body);
    return res.status(201).json(novoQuiz);
  } catch (error) {
    console.error('Erro ao criar quiz:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message || 'Erro interno ao criar o quiz.' });
  }
};
