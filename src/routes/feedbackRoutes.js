// feedbackRoutes.js
import express from 'express';
import { 
  criarFeedback, 
  listarFeedbacksDaPalestra, 
  listarFeedbacksDoUsuario 
} from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/', criarFeedback);
router.get('/palestra/:palestraId', listarFeedbacksDaPalestra);
router.get('/usuario/:participanteId', listarFeedbacksDoUsuario);

export default router;