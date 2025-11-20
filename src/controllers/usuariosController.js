import prisma from '../lib/prisma.js';

const usuariosController = {
  async create(req, res) {
    const { nome, email } = req.body;
    const usuarios = await prisma.usuario.create({
      data: { nome, email },
    });
    res.json(usuarios);
  },
};

export default usuariosController;