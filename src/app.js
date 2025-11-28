import express from 'express';
import cors from 'cors';

// Importação das rotas
import usuariosRoutes from './routes/usuariosRoutes.js'; 
import authRoutes from './routes/authRoutes.js';
import palestrasRoutes from './routes/palestrasRoutes.js';
import presencaRoutes from './routes/presencaRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

const app = express();
const port = 5000;

// Middlewares Globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // cors para o acesso mobile

// Rotas
app.use('/api/v1/usuarios', usuariosRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/palestras', palestrasRoutes);
app.use('/api/v1/presenca', presencaRoutes);
app.use('/api/v1/feedback', feedbackRoutes);

// Rota Raiz de Teste
app.get('/', (req, res) => {
  res.send('API Connect rodando');
});

// Inicialização do Servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});