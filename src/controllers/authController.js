import prisma from '../lib/prisma.js'; 

export const login = async (req, res) => {
  try {
    const { email } = req.body;

    // Validação básica
    if (!email) {
      return res.status(400).json({ error: "O campo e-mail é obrigatório." });
    }

    // Busca o participante no banco pelo e-mail
    const participante = await prisma.participante.findUnique({
      where: { email: email },
    });

    // Se não achar, nega o acesso
    if (!participante) {
      return res.status(401).json({ error: "E-mail não encontrado na lista de inscritos." });
    }

    // Sucesso
    return res.status(200).json({
      message: "Login realizado com sucesso!",
      usuario: participante
    });

  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};