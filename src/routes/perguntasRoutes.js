import express from 'express';
import * as perguntasController from '../controllers/perguntasController.js';

const router = express.Router();

// Rotas administrativas (devem vir primeiro para não conflitar com :id)
// GET /api/v1/perguntas/admin/todas - Listar todas as perguntas (com filtros)
router.get('/admin/todas', perguntasController.listarTodasPerguntas);

// GET /api/v1/perguntas/participante/:participanteId/votos - Contar votos
router.get('/participante/:participanteId/votos', perguntasController.contarVotos);

// GET /api/v1/perguntas/palestra/:palestraId - Listar perguntas aprovadas de uma palestra
router.get('/palestra/:palestraId', perguntasController.listarPorPalestra);

// GET /api/v1/perguntas/palestra/:palestraId/pendentes/:participanteId - Perguntas pendentes do participante
router.get('/palestra/:palestraId/pendentes/:participanteId', perguntasController.listarPendentesPorParticipante);


// POST /api/v1/perguntas - Criar nova pergunta
router.post('/', perguntasController.criar);

// GET /api/v1/perguntas/:id - Buscar pergunta específica
router.get('/:id', perguntasController.buscarPorId);

// PUT /api/v1/perguntas/:id - Editar pergunta (autor, pendente)
router.put('/:id', perguntasController.editarPergunta);

// PUT /api/v1/perguntas/:id/curtir - Toggle voto
router.put('/:id/curtir', perguntasController.toggleCurtida);

// PUT /api/v1/perguntas/:id/responder - Responder pergunta
router.put('/:id/responder', perguntasController.responder);

// PATCH /api/v1/perguntas/:id/aprovar - Aprovar pergunta (Admin)
router.patch('/:id/aprovar', perguntasController.aprovarPergunta);

// PATCH /api/v1/perguntas/:id/premiar - Premiar pergunta
router.patch('/:id/premiar', perguntasController.premiarPergunta);

// PATCH /api/v1/perguntas/:id/rejeitar - Rejeitar pergunta (Admin)
router.patch('/:id/rejeitar', perguntasController.rejeitarPergunta);

// DELETE /api/v1/perguntas/:id - Deletar pergunta (Admin ou autor)
router.delete('/:id', perguntasController.deletarPergunta);

export default router;

