import express from 'express';
import * as perguntasController from '../controllers/perguntasController.js';

const router = express.Router();

// POST /api/v1/perguntas - Criar pergunta
router.post('/', perguntasController.criar);

// GET /api/v1/perguntas/palestra/:palestraId - Listar perguntas
router.get('/palestra/:palestraId', perguntasController.listarPorPalestra);

// GET /api/v1/perguntas/participante/:participanteId/votos - Contar votos
router.get('/participante/:participanteId/votos', perguntasController.contarVotos);

// GET /api/v1/perguntas/:id - Buscar pergunta específica
router.get('/:id', perguntasController.buscarPorId);

// PUT /api/v1/perguntas/:id/curtir - Toggle voto
router.put('/:id/curtir', perguntasController.toggleCurtida);

// PUT /api/v1/perguntas/:id/responder - Responder pergunta
router.put('/:id/responder', perguntasController.responder);

export default router;
