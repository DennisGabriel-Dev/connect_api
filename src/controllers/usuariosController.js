import prisma from "../lib/prisma.js";

const usuariosController = {
  async create(req, res) {
    try {
      const { nome, email, even3Id } = req.body;

      // Validações
      if (!nome || !email || !even3Id) {
        return res.status(400).json({
          error: 'Campos obrigatórios: nome, email, even3Id'
        });
      }

      const usuario = await prisma.participante.create({
        data: {
          nome,
          email,
          even3Id: parseInt(even3Id) // Garantir que é número
        },
      });

      res.status(201).json(usuario);
    } catch (error) {
      console.error('Erro ao criar participante:', error);

      // Erro de duplicação (email ou even3Id único)
      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'Email ou even3Id já cadastrado'
        });
      }

      res.status(500).json({ error: 'Erro ao criar participante' });
    }
  },

  // Listar todos os participantes
  async listar(req, res) {
    try {
      const participantes = await prisma.participante.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          even3Id: true,
          tipoUsuario: true,
          turma: true,
          perfilCompleto: true,
        },
      });
      res.status(200).json(participantes);
    } catch (error) {
      console.error("Erro ao listar participantes:", error);
      res.status(500).json({ error: "Erro ao listar participantes" });
    }
  },
};

export default usuariosController;
