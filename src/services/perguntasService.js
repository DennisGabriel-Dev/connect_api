import prisma from '../lib/prisma.js';

// Criar pergunta
export async function criarPergunta({ texto, participanteId, palestraId }) {
    return await prisma.pergunta.create({
        data: {
            texto,
            participanteId,
            palestraId,
            status: 'pendente', // Inicia como pendente
            curtidas: 0,
            respondida: false
        }
    });
}

// Listar perguntas por palestra (ordenadas por votos)
export async function listarPerguntasPorPalestra(palestraId, status = null) {
    const whereClause = { palestraId };

    // Se status for especificado, filtrar por ele
    if (status) {
        whereClause.status = status;
    }

    const perguntas = await prisma.pergunta.findMany({
        where: whereClause,
        include: {
            participante: {
                select: { nome: true, id: true }
            },
            palestra: {
                select: { titulo: true }
            },
            votos: {
                select: { participanteId: true }
            }
        },
        orderBy: [
            { curtidas: 'desc' }, // Mais votadas primeiro
            { dataHora: 'desc' }  // Mais recentes em caso de empate
        ]
    });

    return perguntas.map(p => ({
        _id: p.id,
        id: p.id,
        texto: p.texto,
        participanteId: p.participanteId,
        participanteNome: p.participante.nome,
        palestraId: p.palestraId,
        palestraTitulo: p.palestra.titulo,
        dataHora: p.dataHora.toISOString(),
        respondida: p.respondida,
        resposta: p.resposta,
        palestranteNome: p.palestranteNome,
        dataResposta: p.dataResposta?.toISOString(),
        curtidas: p.curtidas,
        usuariosVotaram: p.votos.map(v => v.participanteId), // Array de IDs que votaram
        status: p.status // Incluir status
    }));
}

// Buscar pergunta por ID
export async function buscarPerguntaPorId(id) {
    const pergunta = await prisma.pergunta.findUnique({
        where: { id },
        include: {
            participante: { select: { nome: true } },
            palestra: { select: { titulo: true } },
            votos: { select: { participanteId: true } }
        }
    });

    if (!pergunta) return null;

    return {
        _id: pergunta.id,
        id: pergunta.id,
        texto: pergunta.texto,
        participanteId: pergunta.participanteId,
        participanteNome: pergunta.participante.nome,
        palestraId: pergunta.palestraId,
        palestraTitulo: pergunta.palestra.titulo,
        dataHora: pergunta.dataHora.toISOString(),
        respondida: pergunta.respondida,
        resposta: pergunta.resposta,
        palestranteNome: pergunta.palestranteNome,
        dataResposta: pergunta.dataResposta?.toISOString(),
        curtidas: pergunta.curtidas,
        usuariosVotaram: pergunta.votos.map(v => v.participanteId),
        status: pergunta.status // Incluir status
    };
}

// Toggle voto (adicionar ou remover)
export async function toggleVoto(perguntaId, participanteId) {
    // 1. Buscar pergunta e verificar período de votação
    const pergunta = await prisma.pergunta.findUnique({
        where: { id: perguntaId },
        include: { palestra: true }
    });

    if (!pergunta) {
        throw new Error('Pergunta não encontrada');
    }

    // 2. Impedir voto na própria pergunta
    if (pergunta.participanteId === participanteId) {
        throw new Error('Você não pode votar na sua própria pergunta');
    }

    // 3. Verificar período de votação (se definido)
    const { votacaoInicio, votacaoFim } = pergunta.palestra;
    if (votacaoInicio && votacaoFim) {
        const agora = new Date();
        if (agora < votacaoInicio || agora > votacaoFim) {
            throw new Error('O período de votação para esta atividade encerrou');
        }
    }

    // 4. Verificar se já votou
    const votoExistente = await prisma.voto.findUnique({
        where: {
            participanteId_perguntaId: {
                participanteId,
                perguntaId
            }
        }
    });

    let acao;

    if (votoExistente) {
        // REMOVER voto
        await prisma.$transaction([
            prisma.voto.delete({
                where: { id: votoExistente.id }
            }),
            prisma.pergunta.update({
                where: { id: perguntaId },
                data: { curtidas: { decrement: 1 } }
            })
        ]);
        acao = 'removido';
    } else {
        // ADICIONAR voto
        // Verificar limite de 3 votos
        const votosParticipante = await prisma.voto.count({
            where: {
                participanteId,
                pergunta: { palestraId: pergunta.palestraId }
            }
        });

        if (votosParticipante >= 3) {
            throw new Error('Você atingiu o limite de 3 votos nesta atividade. Desfaça um voto antes de votar em outra pergunta.');
        }

        await prisma.$transaction([
            prisma.voto.create({
                data: {
                    participanteId,
                    perguntaId
                }
            }),
            prisma.pergunta.update({
                where: { id: perguntaId },
                data: { curtidas: { increment: 1 } }
            })
        ]);
        acao = 'adicionado';
    }

    // Retornar pergunta atualizada
    const perguntaAtualizada = await buscarPerguntaPorId(perguntaId);
    return { pergunta: perguntaAtualizada, acao };
}

// Responder pergunta
export async function responderPergunta(id, resposta, palestranteNome) {
    const pergunta = await prisma.pergunta.update({
        where: { id },
        data: {
            respondida: true,
            resposta,
            palestranteNome,
            dataResposta: new Date()
        }
    });

    return buscarPerguntaPorId(pergunta.id);
}

// Contar votos de um participante em uma palestra específica
export async function contarVotosParticipante(participanteId, palestraId) {
    return await prisma.voto.count({
        where: {
            participanteId,
            pergunta: { palestraId }
        }
    });
}

// Buscar IDs das perguntas que o participante votou
export async function buscarVotosDoParticipante(participanteId, palestraId) {
    const votos = await prisma.voto.findMany({
        where: {
            participanteId,
            pergunta: { palestraId }
        },
        select: { perguntaId: true }
    });

    return votos.map(v => v.perguntaId);
}
