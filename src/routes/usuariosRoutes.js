import { Router } from 'express';
import usuariosController from '../controllers/usuariosController.js';

const router = Router();

router.post('/', usuariosController.create);

export default router;