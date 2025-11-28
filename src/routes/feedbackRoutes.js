import express from "express";
import { 
  criarFeedback, 
  listarFeedbacksDaPalestra, 
  listarFeedbacksDoUsuario 
} from "../controllers/feedbackController.js";

const router = express.Router();

// POST /api/v1/feedback
router.post("/", criarFeedback);

// GET /api/v1/feedback/palestra/:palestraId
router.get("/palestra/:palestraId", listarFeedbacksDaPalestra);

// GET /api/v1/feedback/usuario/:participanteId
router.get("/usuario/:participanteId", listarFeedbacksDoUsuario);

export default router;
