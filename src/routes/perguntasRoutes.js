import express from 'express';
import {
  criarPergunta,
  listarPerguntasPorPalestra,
  listarPerguntasPorParticipante,
  responderPergunta,
  curtirPergunta,
  deletarPergunta,
  obterPergunta
} from '../controllers/perguntasController.js';

const router = express.Router();

// Rotas de perguntas

// POST - Criar uma nova pergunta
router.post('/', criarPergunta);

// GET - Listar todas as perguntas de uma palestra
// Query params: ?respondidas=true ou ?respondidas=false (opcional)
// IMPORTANTE: Rotas específicas devem vir ANTES de rotas com parâmetros genéricos
router.get('/palestra/:palestraId', listarPerguntasPorPalestra);

// GET - Listar todas as perguntas de um participante
router.get('/participante/:participanteId', listarPerguntasPorParticipante);

// PUT - Curtir uma pergunta (incrementa contador de curtidas)
router.put('/:id/curtir', curtirPergunta);

// PUT - Responder uma pergunta
router.put('/:id/responder', responderPergunta);

// GET - Obter uma pergunta específica por ID
router.get('/:id', obterPergunta);

// DELETE - Deletar uma pergunta
router.delete('/:id', deletarPergunta);

export default router;
