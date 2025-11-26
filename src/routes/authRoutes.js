import express from 'express';
import { login } from '../controllers/authController.js';

const router = express.Router();

// Rota: POST /api/v1/auth/login (lembrar disso)
router.post('/login', login);

export default router;