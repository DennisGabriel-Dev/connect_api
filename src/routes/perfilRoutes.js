import { Router } from 'express';
import { atualizarPerfil, buscarPerfil } from '../controllers/perfilController.js';

const router = Router();

// PATCH /api/v1/participantes/:participanteId/perfil - Atualizar perfil
router.patch('/:participanteId/perfil', atualizarPerfil);

// GET /api/v1/participantes/:participanteId/perfil - Buscar perfil
router.get('/:participanteId/perfil', buscarPerfil);

export default router;
