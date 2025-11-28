import express from 'express';
import { registrarPresenca, listarPresencas, registrarPresencaViaQr } from '../controllers/presencaController.js';

const router = express.Router();

// POST /api/v1/presenca - Registrar presença
router.post('/', registrarPresenca);

// GET /api/v1/presenca/qr?participanteId=XXX&palestraId=YYY - Registrar presença via QR Code
router.get('/qr', registrarPresencaViaQr);

// GET /api/v1/presenca/:participanteId - Listar presencas de um participante
router.get('/:participanteId', listarPresencas);

export default router;
