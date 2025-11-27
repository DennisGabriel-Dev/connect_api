import express from 'express';
import { login, cadastrarSenha } from '../controllers/authController.js';

const router = express.Router();

// Rota para quem já tem senha: POST /api/v1/auth/login
router.post('/login', login);

// Rota para criar a senha (primeiro acesso): POST /api/v1/auth/register
router.post('/register', cadastrarSenha);

export default router;