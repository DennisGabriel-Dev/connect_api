import express from 'express';
import { listar, listarPalestrasPorParticipante, obterQuizDaPalestra, iniciarPeriodoVotacao, encerrarPeriodoVotacao, obterPeriodoVotacao } from '../controllers/palestrasController.js';

const router = express.Router();

// GET /api/v1/palestras - Listar palestras (com filtro opcional por tipo)
router.get('/', listar);

// GET /api/v1/palestras/participante/:participanteId - Listar palestras por participante
router.get('/participante/:participanteId', listarPalestrasPorParticipante);

// GET /api/v1/palestras/:id/quiz - Obter quiz da palestra
router.get('/:id/quiz', obterQuizDaPalestra);

// GET /api/v1/palestras/:id/periodo-votacao - Obter status do período
router.get('/:id/periodo-votacao', obterPeriodoVotacao);

// POST /api/v1/palestras/:id/periodo-votacao/iniciar - Iniciar período (Admin)
router.post('/:id/periodo-votacao/iniciar', iniciarPeriodoVotacao);

// POST /api/v1/palestras/:id/periodo-votacao/encerrar - Encerrar período (Admin)
router.post('/:id/periodo-votacao/encerrar', encerrarPeriodoVotacao);

export default router;
