import express from 'express'
import { listarTodos, listarLiberados, buscarPorId, responder, criarQuiz } from '../controllers/quizController.js'

const router = express.Router()

router.get('/', listarTodos)                   // GET http://localhost:5000/api/quizzes/
router.get('/liberados', listarLiberados)      // GET http://localhost:5000/api/quizzes/liberados
router.get('/:id', buscarPorId)                // GET http://localhost:5000/api/quizzes/{ID}
// router.post('/', criarQuiz)                    // POST http://localhost:5000/api/quizzes/
router.post('/responder/:id', responder)       // POST http://localhost:5000/api/quizzes/responder/{ID}

export default router