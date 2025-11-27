import prisma from '../lib/prisma.js';

const usuariosController = {
  async create(req, res) {
    const { nome, email } = req.body;
    const usuarios = await prisma.participante.create({
      data: { nome, email },
    });
    res.json(usuarios);
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
          foto: true
        }
      });
      res.status(200).json(participantes);
    } catch (error) {
      console.error("Erro ao listar participantes:", error);
      res.status(500).json({ error: "Erro ao listar participantes" });
    }
  },
};

export default usuariosController;