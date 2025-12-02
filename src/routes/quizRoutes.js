import express from 'express'
import { listarTodos, listarLiberados, buscarPorId, responder, buscarPorIdParticipante, listarComStatus} from '../controllers/quizController.js'

const router = express.Router()

router.get('/participante/status', listarComStatus) // GET http://localhost:5000/api/quizzes/participante/status
router.get('/participante/:id', buscarPorIdParticipante) // GET http://localhost:5000/api/quizzes/participante/{ID}
router.get('/liberados', listarLiberados)      // GET http://localhost:5000/api/quizzes/liberados
router.post('/responder/:id', responder)       // POST http://localhost:5000/api/quizzes/responder/{ID}
router.get('/:id', buscarPorId)                // GET http://localhost:5000/api/quizzes/{ID}
router.get('/', listarTodos)                   // GET http://localhost:5000/api/quizzes/
// router.post('/', criarQuiz)                    // POST http://localhost:5000/api/quizzes/

export default router