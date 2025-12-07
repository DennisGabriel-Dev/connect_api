import express from 'express';
import * as perguntasController from '../controllers/perguntasController.js';

const router = express.Router();

// Rotas públicas (para usuários)
// GET /api/v1/perguntas/palestra/:palestraId - Listar perguntas aprovadas de uma palestra
router.get('/palestra/:palestraId', perguntasController.listarPerguntasPorPalestra);

// POST /api/v1/perguntas - Criar nova pergunta
router.post('/', perguntasController.criarPergunta);

// Rotas administrativas
// GET /api/v1/perguntas/admin/todas - Listar todas as perguntas (com filtros)
router.get('/admin/todas', perguntasController.listarTodasPerguntas);

// PATCH /api/v1/perguntas/:id/aprovar - Aprovar pergunta
router.patch('/:id/aprovar', perguntasController.aprovarPergunta);

// PATCH /api/v1/perguntas/:id/rejeitar - Rejeitar pergunta
router.patch('/:id/rejeitar', perguntasController.rejeitarPergunta);

// DELETE /api/v1/perguntas/:id - Deletar pergunta
router.delete('/:id', perguntasController.deletarPergunta);

export default router;
