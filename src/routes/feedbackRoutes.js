// feedbackRoutes.js
import express from 'express';
import { 
  criarFeedback, 
  listarFeedbacksDaPalestra, 
  listarFeedbacksDoUsuario,
  listarIdsParaTeste
} from '../controllers/feedbackController.js';

const router = express.Router();

router.get('/teste-ids', listarIdsParaTeste);
router.post('/', criarFeedback);
router.get('/palestra/:palestraId', listarFeedbacksDaPalestra);
router.get('/usuario/:participanteId', listarFeedbacksDoUsuario);

export default router;