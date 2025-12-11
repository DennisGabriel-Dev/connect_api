import prisma from '../lib/prisma.js';

/**
 * Verifica se o período de votação está ativo para uma palestra
 * @param {Object} palestra - Objeto da palestra
 * @returns {Object} { ativo: boolean, motivo: string | null }
 */
export function verificarPeriodoAtivo(palestra) {
    if (!palestra.periodoVotacaoAtivo) {
        return {
            ativo: false,
            motivo: 'O período de perguntas e votação está encerrado para esta atividade'
        };
    }

    return {
        ativo: true,
        motivo: null
    };
}

/**
 * Busca palestra e verifica período (helper para controllers)
 * @param {string} palestraId - ID da palestra
 * @returns {Promise<Object>} { palestra, periodoStatus }
 * @throws {Error} Se palestra não encontrada
 */
export async function buscarPalestraComPeriodo(palestraId) {
    const palestra = await prisma.palestra.findUnique({
        where: { id: palestraId }
    });

    if (!palestra) {
        throw new Error('Palestra não encontrada');
    }

    const periodoStatus = verificarPeriodoAtivo(palestra);

    return { palestra, periodoStatus };
}
