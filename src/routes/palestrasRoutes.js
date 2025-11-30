import express from 'express';
import { listar, listarPalestrasPorParticipante } from '../controllers/palestrasController.js';

const router = express.Router();

// Rota: GET /api/v1/palestras
// Aceita filtro: /api/v1/palestras?tipo=Workshop( para testes no insominia )
router.get('/', listar);

// Rota: GET /api/v1/palestras/participante/:participanteId
// Lista todas as palestras vinculadas a um participante através das presenças
router.get('/participante/:participanteId', listarPalestrasPorParticipante);

export default router;