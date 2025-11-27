import { Router } from 'express';
import usuariosController from '../controllers/usuariosController.js';

const router = Router();

// POST /api/v1/usuarios - Criar participante
router.post('/', usuariosController.create);

// GET /api/v1/usuarios - Listar todos (apenas para testes)
router.get('/', usuariosController.listar);

export default router;