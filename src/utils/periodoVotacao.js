import prisma from '../lib/prisma.js';

/**
 * Calcula o período padrão de votação baseado nos horários da palestra
 * @param {Object} palestra - Objeto da palestra com horarios
 * @returns {Object} { votacaoInicio: Date, votacaoFim: Date } ou null se não houver horários
 */
export function calcularPeriodoPadrao(palestra) {
    if (!palestra.horarios || palestra.horarios.length === 0) {
        return null;
    }

    // Pegar o primeiro horário (assumindo que date_start e date_end estão no primeiro)
    const horario = palestra.horarios[0];

    if (!horario.date_start || !horario.date_end) {
        return null;
    }

    const inicio = new Date(horario.date_start);
    const fim = new Date(horario.date_end);

    // Subtrair 10 minutos do fim
    const fimAjustado = new Date(fim.getTime() - 10 * 60 * 1000);

    return {
        votacaoInicio: inicio,
        votacaoFim: fimAjustado
    };
}

/**
 * Obtém o período efetivo de votação (configurado ou padrão)
 * @param {Object} palestra - Objeto da palestra
 * @returns {Object} { votacaoInicio: Date, votacaoFim: Date, isPadrao: boolean } ou null
 */
export function obterPeriodoVotacao(palestra) {
    // Se tiver período configurado, usar ele
    if (palestra.votacaoInicio && palestra.votacaoFim) {
        return {
            votacaoInicio: palestra.votacaoInicio,
            votacaoFim: palestra.votacaoFim,
            isPadrao: false
        };
    }

    // Caso contrário, calcular período padrão
    const periodoPadrao = calcularPeriodoPadrao(palestra);

    if (!periodoPadrao) {
        // Sem período configurado e sem horários válidos = sem restrição
        return null;
    }

    return {
        ...periodoPadrao,
        isPadrao: true
    };
}

/**
 * Verifica se o período de votação está ativo
 * @param {Object} palestra - Objeto da palestra
 * @returns {Object} { ativo: boolean, periodo: Object | null, motivo: string | null }
 */
export function verificarPeriodoAtivo(palestra) {
    const periodo = obterPeriodoVotacao(palestra);

    // Sem período = sempre ativo (sem restrições)
    if (!periodo) {
        return {
            ativo: true,
            periodo: null,
            motivo: null
        };
    }

    const agora = new Date();
    const { votacaoInicio, votacaoFim } = periodo;

    // Verificar se está dentro do período
    if (agora < votacaoInicio) {
        return {
            ativo: false,
            periodo,
            motivo: `O período de perguntas ainda não iniciou. Inicia em ${votacaoInicio.toLocaleString('pt-BR')}`
        };
    }

    if (agora > votacaoFim) {
        return {
            ativo: false,
            periodo,
            motivo: 'O período de perguntas e votação desta atividade encerrou'
        };
    }

    return {
        ativo: true,
        periodo,
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
