import prisma from '../lib/prisma.js'
import crypto from 'crypto';

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
export const buscarQuizPorId = async (id, participanteId) => {

  const tentativaExistente = await prisma.tentativa.findUnique({
    where: {
      participanteId_quizId: {
        participanteId,
        quizId: id,
      },
    },
  })

  if (tentativaExistente) {
    throw new Error('Você já respondeu a este quiz.')
  }

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

export const buscarQuizzesRespondidosPorParticipante = async (participanteId) => {

  const tentativas = await prisma.tentativa.findMany({
    where: {
      participanteId: participanteId
    },
    orderBy: {
      enviadoEm: 'desc'
    },
    include:{
      quiz:{
        select:{
          id: true,
          titulo: true,
          descricao: true,
          palestraId: true
        }
      }
    }
  })

  return tentativas.map(tentativa => ({
    tentativaId: tentativa.id,
    quizId: tentativa.quiz.id,
    titulo: tentativa.quiz.titulo,
    descricao: tentativa.quiz.descricao,
    pontos: tentativa.pontosObtidos
  }))
  
}

export const listarStatusQuizzes = async (participanteId) => {
  const quizzes = await prisma.quiz.findMany({
    where:{
      liberado: true
    },
    include:{
      tentativas:{
        where:{
          participanteId: participanteId
        },
        take: 1
      },
      palestra: {
        select:{
          id: true,
          titulo: true
        }
      }
    }
  })

  const resultado = quizzes.map(quiz => {
    const tentativa = quiz.tentativas[0]

    if (tentativa) {
      return {
        id: quiz.id,
        titulo: quiz.titulo,
        descricao: quiz.descricao,
        palestraId: quiz.palestra.id,
        palestraTitulo: quiz.palestra.titulo,
        status: 'RESPONDIDO',
        pontuacao: tentativa.pontosObtidos,
        dataResposta: tentativa.enviadoEm
      }
    } else {
      return {
        id: quiz.id,
        titulo: quiz.titulo,
        descricao: quiz.descricao,
        palestraId: quiz.palestra.id,
        palestraTitulo: quiz.palestra.titulo,
        status: 'PENDENTE',
        pontuacao: null,
        dataResposta: null
      }
    }
  })

  return resultado
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

// export const criarQuiz = async (dadosQuiz) => {
//   const { titulo, descricao, liberado, perguntas, palestraId } = dadosQuiz;

//   // 1. Valida se a palestra associada existe
//   const palestraExistente = await prisma.palestra.findUnique({
//     where: { id: palestraId },
//   });

//   if (!palestraExistente) {
//     const error = new Error('Palestra não encontrada.');
//     error.statusCode = 404;
//     throw error;
//   }

//   // 2. Cria o quiz e suas perguntas/opções aninhadas
//   const novoQuiz = await prisma.quiz.create({
//     data: {
//       titulo,
//       descricao,
//       liberado,
//       palestra: {
//         connect: { id: palestraId },
//       },
//       // Correção: Para documentos embutidos (composite types) no MongoDB,
//       // usamos 'set' para definir o array de objetos diretamente.
//       perguntas: perguntas.map(pergunta => ({
//         id: crypto.randomBytes(12).toString('hex'), // Gera um ID para a pergunta
//         texto: pergunta.texto,
//         pontos: pergunta.pontos,
//         opcoes: pergunta.opcoes.map(opcao => ({
//           id: crypto.randomBytes(12).toString('hex'), // Gera um ID para a opção
//           texto: opcao.texto,
//           eCorreta: opcao.eCorreta,
//         })),
//       })),
//     },
//   });

//   return novoQuiz;
// };
