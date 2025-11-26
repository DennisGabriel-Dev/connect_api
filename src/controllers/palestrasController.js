import prisma from '../lib/prisma.js'; 


export const listar = async (req, res) => {
  try {
    
    const { tipo } = req.query;

    const whereClause = {};
    
    // Se o filtro vier preenchido, adiciona na busca
    if (tipo) {
      whereClause.tipo = tipo;
    }

    const palestras = await prisma.palestra.findMany({
      where: whereClause,
    });

    return res.status(200).json(palestras);

  } catch (error) {
    console.error("Erro ao listar palestras:", error);
    return res.status(500).json({ error: "Erro ao buscar a lista de palestras." });
  }
};