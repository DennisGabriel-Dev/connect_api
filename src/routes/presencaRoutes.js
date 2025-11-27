import express from 'express';
import { registrarPresenca, listarPresencas } from '../controllers/presencaController.js';

const router = express.Router();

// POST /api/v1/presenca - Registrar presença
router.post('/', registrarPresenca);

// GET /api/v1/presenca/:participanteId - Listar presencas de um participante
router.get('/:participanteId', listarPresencas);

export default router;
