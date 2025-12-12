import express from 'express';
import { getTudo, getDetalhesUsuario } from '../controllers/sorteioController.js';

const router = express.Router();

router.post('/usuarios/all', getTudo);
router.get('/usuarios/:participanteId/detalhes', getDetalhesUsuario);

export default router;
