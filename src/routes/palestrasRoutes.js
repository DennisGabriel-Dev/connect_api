import express from 'express';
import { listar, listarPalestrasPorParticipante } from '../controllers/palestrasController.js';

const router = express.Router();

// Rota: GET /api/v1/palestras
// Aceita filtro: /api/v1/palestras?tipo=Workshop( para testes no insominia )

// Rota: GET /api/palestras/:id/quiz
import { obterQuizDaPalestra } from '../controllers/palestrasController.js';
router.get('/:id/quiz', obterQuizDaPalestra);

router.get('/', listar);

// Rota: GET /api/v1/palestras/participante/:participanteId
// Lista todas as palestras vinculadas a um participante através das presenças
router.get('/participante/:participanteId', listarPalestrasPorParticipante);

export default router;