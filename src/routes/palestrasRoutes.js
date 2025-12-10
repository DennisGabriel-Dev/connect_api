import express from 'express';
import { listar, listarPalestrasPorParticipante, obterQuizDaPalestra, configurarPeriodoVotacao, obterPeriodoVotacao } from '../controllers/palestrasController.js';

const router = express.Router();

// GET /api/v1/palestras - Listar palestras (com filtro opcional por tipo)
router.get('/', listar);

// GET /api/v1/palestras/participante/:participanteId - Listar palestras por participante
router.get('/participante/:participanteId', listarPalestrasPorParticipante);

// GET /api/v1/palestras/:id/quiz - Obter quiz da palestra
router.get('/:id/quiz', obterQuizDaPalestra);

// GET /api/v1/palestras/:id/periodo-votacao - Obter período de votação
router.get('/:id/periodo-votacao', obterPeriodoVotacao);

// PATCH /api/v1/palestras/:id/periodo-votacao - Configurar período de votação (Admin)
router.patch('/:id/periodo-votacao', configurarPeriodoVotacao);

export default router;