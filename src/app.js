import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Importação das rotas
import usuariosRoutes from './routes/usuariosRoutes.js'; 
import authRoutes from './routes/authRoutes.js';
import palestrasRoutes from './routes/palestrasRoutes.js';
import presencaRoutes from './routes/presencaRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import sorteioRoutes from './routes/sorteioRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import perguntasRoutes from './routes/perguntasRoutes.js';
import perfilRoutes from './routes/perfilRoutes.js';

const app = express();
const port = 5000;

// Middlewares Globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Rotas
app.use('/api/v1/usuarios', usuariosRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/palestras', palestrasRoutes);
app.use('/api/v1/presenca', presencaRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/sorteio', sorteioRoutes);
app.use('/api/v1/quizzes', quizRoutes);

app.use('/api/v1/perguntas', perguntasRoutes);
app.use('/api/v1/participantes', perfilRoutes);

// Rota Raiz de Teste
app.get('/', (req, res) => {
  res.send('API Connect rodando');
});

// Inicialização do Servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
