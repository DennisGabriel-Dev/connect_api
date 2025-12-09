import prisma from '../lib/prisma.js';

// Atualizar perfil do participante com tipo de usuário e turma
export const atualizarPerfil = async (req, res) => {
  try {
    const { participanteId } = req.params;
    const { tipoUsuario, turma } = req.body;

    // Validações
    if (!tipoUsuario) {
      return res.status(400).json({ error: "Tipo de usuário é obrigatório." });
    }

    const tiposValidos = ["publico_externo", "docente", "discente"];
    if (!tiposValidos.includes(tipoUsuario)) {
      return res.status(400).json({ 
        error: "Tipo de usuário inválido. Use: publico_externo, docente ou discente." 
      });
    }

    if (tipoUsuario === "discente" && !turma) {
      return res.status(400).json({ error: "Turma é obrigatória para discentes." });
    }

    // Verifica se o participante existe
    const participanteExiste = await prisma.participante.findUnique({
      where: { id: participanteId }
    });

    if (!participanteExiste) {
      return res.status(404).json({ error: "Participante não encontrado." });
    }

    // Atualizar participante
    const participanteAtualizado = await prisma.participante.update({
      where: { id: participanteId },
      data: {
        tipoUsuario,
        turma: tipoUsuario === "discente" ? turma : null,
        perfilCompleto: true
      }
    });

    // Remove senha do retorno
    const { senha: _, ...dadosParticipante } = participanteAtualizado;

    return res.status(200).json({
      message: "Perfil atualizado com sucesso!",
      participante: dadosParticipante
    });

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
};

// Buscar perfil do participante
export const buscarPerfil = async (req, res) => {
  try {
    const { participanteId } = req.params;

    const participante = await prisma.participante.findUnique({
      where: { id: participanteId },
      select: {
        id: true,
        nome: true,
        email: true,
        even3Id: true,
        tipoUsuario: true,
        turma: true,
        perfilCompleto: true,
        role: true
      }
    });

    if (!participante) {
      return res.status(404).json({ error: "Participante não encontrado." });
    }

    return res.status(200).json({ participante });

  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return res.status(500).json({ error: "Erro ao buscar perfil." });
  }
};
