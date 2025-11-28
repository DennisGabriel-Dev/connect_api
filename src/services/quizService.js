import prisma from '../lib/prisma.js'

export const listarQuizzes = async () => {
  const quizzes = await prisma.quiz.findMany({
    select: {
      id: true,
      titulo: true,
      descricao: true,
      liberado: true,
      _count: true
    }
  })

  return quizzes
}

export const listarQuizzesLiberados = async () => {
  const quizzes = await prisma.quiz.findMany({
    where: { liberado: true },
    select: {
      id: true,
      titulo: true,
      descricao: true,
      liberado: true,
      _count: true
    }
  })

  return quizzes
}

// Busca quiz pelo id para o participante
// Remove informação `eCorreta` das opções antes de retornar
export const buscarQuizPorId = async (id) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id }
  })

  if (!quiz) return null

  // 2. Lógica de Aleatoriedade e Segurança
  // Como é Embedded, acessamos quiz.perguntas diretamente
  
  // A. Embaralha a ordem das perguntas
  const perguntasEmbaralhadas = embaralharArray(quiz.perguntas || [])

  const safePerguntas = perguntasEmbaralhadas.map(p => {
    // B. Embaralha as opções desta pergunta
    const opcoesEmbaralhadas = embaralharArray(p.opcoes || [])

    return {
      id: p.id,
      texto: p.texto,
      pontos: p.pontos,
      // C. Sanitização: Mapeamos apenas ID e Texto para remover 'eCorreta'
      opcoes: opcoesEmbaralhadas.map(o => ({
        id: o.id,
        texto: o.texto
      }))
    }
  })

  // 3. Monta o objeto de resposta seguro
  const safeQuiz = {
    id: quiz.id,
    titulo: quiz.titulo,
    descricao: quiz.descricao,
    liberado: quiz.liberado,
    perguntas: safePerguntas // Array tratado
  }

  return safeQuiz
}

const embaralharArray = (array) => {
  const novoArray = [...array];
  for (let i = novoArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [novoArray[i], novoArray[j]] = [novoArray[j], novoArray[i]];
  }
  return novoArray;
}

/**
 * Responder Quiz e Calcular Pontuação
 * - Verifica tentativa existente (composite unique participanteId_quizId)
 * - Usa embeds para validar perguntas/opcoes
 * - Cria Tentativa e Pontuacao (coleção separada) em transação
 */
export const responderQuiz = async (quizId, participanteId, respostas) => {
  // Verifica se o participante já respondeu
  const tentativaExistente = await prisma.tentativa.findUnique({
    where: {
      participanteId_quizId: {
        participanteId,
        quizId,
      },
    },
  })

  if (tentativaExistente) {
    throw new Error('O participante já respondeu a este quiz.')
  }

  // Busca o quiz com embeds
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } })
  if (!quiz) throw new Error('Quiz não encontrado')
  if (!quiz.liberado) throw new Error('Quiz ainda não está liberado')

  let pontuacaoObtida = 0
  let pontuacaoMaxima = 0
  const detalhesRespostas = []

  for (const resp of respostas) {
    const pergunta = (quiz.perguntas || []).find(p => String(p.id) === String(resp.perguntaId))
    if (!pergunta) throw new Error(`Pergunta não pertence a este quiz: ${resp.perguntaId}`)

    pontuacaoMaxima += pergunta.pontos || 0

    const opcao = (pergunta.opcoes || []).find(o => String(o.id) === String(resp.opcaoId))
    if (!opcao) throw new Error(`Opção inválida para pergunta ${resp.perguntaId}`)

    const acertou = !!opcao.eCorreta
    const pontosPergunta = acertou ? (pergunta.pontos || 0) : 0
    pontuacaoObtida += pontosPergunta

    detalhesRespostas.push({ perguntaId: pergunta.id, opcaoId: opcao.id, acertou, pontosObtidos: pontosPergunta })
  }

  // Cria tentativa e registra pontuação em transação
  const [tentativa, pontuacao] = await prisma.$transaction([
    prisma.tentativa.create({
      data: {
        participanteId,
        quizId,
        pontosObtidos: pontuacaoObtida,
      },
    }),
    prisma.pontuacao.create({
      data: {
        participanteId,
        quizId,
        pontos: pontuacaoObtida,
      },
    })
  ])

  return { tentativa, pontuacao, pontuacaoMaxima, detalhesRespostas }
}