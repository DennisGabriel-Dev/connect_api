import express from 'express';
import { getTudo } from '../controllers/sorteioController.js';

const router = express.Router();

router.post('/usuarios/all', getTudo);

export default router;
