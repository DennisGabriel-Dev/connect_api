import express from 'express';
import { listar } from '../controllers/palestrasController.js';

const router = express.Router();

// Rota: GET /api/v1/palestras
// Aceita filtro: /api/v1/palestras?tipo=Workshop( para testes no insominia )
router.get('/', listar);

export default router;