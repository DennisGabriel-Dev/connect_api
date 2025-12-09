import prisma from '../lib/prisma.js';
import * as perguntasService from '../services/perguntasService.js';

// POST /api/v1/perguntas - Criar pergunta
export const criar = async (req, res) => {
    try {
        const { texto, participanteId, participanteNome, palestraId, palestraTitulo } = req.body;

        if (!texto || !participanteId || !palestraId) {
            return res.status(400).json({ error: 'Campos obrigatórios faltando' });
        }

        const pergunta = await perguntasService.criarPergunta({
            texto,
            participanteId,
            palestraId
        });

        // Buscar dados completos para retorno
        const perguntaCompleta = await perguntasService.buscarPerguntaPorId(pergunta.id);

        return res.status(201).json({
            success: true,
            message: 'Pergunta criada com sucesso',
            data: perguntaCompleta
        });
    } catch (error) {
        console.error('Erro ao criar pergunta:', error);
        return res.status(500).json({ error: 'Erro ao criar pergunta' });
    }
};

// GET /api/v1/perguntas/palestra/:palestraId - Listar perguntas
export const listarPorPalestra = async (req, res) => {
    try {
        const { palestraId } = req.params;
        const perguntas = await perguntasService.listarPerguntasPorPalestra(palestraId);

        return res.status(200).json({
            success: true,
            count: perguntas.length,
            data: perguntas
        });
    } catch (error) {
        console.error('Erro ao listar perguntas:', error);
        return res.status(500).json({ error: 'Erro ao listar perguntas' });
    }
};

// GET /api/v1/perguntas/:id - Buscar pergunta
export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const pergunta = await perguntasService.buscarPerguntaPorId(id);

        if (!pergunta) {
            return res.status(404).json({ error: 'Pergunta não encontrada' });
        }

        return res.status(200).json({ success: true, data: pergunta });
    } catch (error) {
        console.error('Erro ao buscar pergunta:', error);
        return res.status(500).json({ error: 'Erro ao buscar pergunta' });
    }
};

// PUT /api/v1/perguntas/:id/curtir - Votar (toggle)
export const toggleCurtida = async (req, res) => {
    try {
        const { id: perguntaId } = req.params;
        const participanteId = req.user?.id ?? req.headers['x-participante-id'];

        if (!participanteId) {
            return res.status(401).json({ error: 'Autenticação necessária' });
        }

        const resultado = await perguntasService.toggleVoto(perguntaId, participanteId);

        return res.status(200).json({
            success: true,
            message: resultado.acao === 'adicionado' ? 'Voto registrado' : 'Voto removido',
            data: resultado.pergunta
        });
    } catch (error) {
        const { id: perguntaId } = req.params;
        const participanteId = req.user?.id ?? req.headers['x-participante-id'];

        if (error.message.includes('limite') || error.message.includes('3 votos')) {
            return res.status(400).json({ error: error.message });
        }
        if (error.message.includes('período') || error.message.includes('encerrou')) {
            return res.status(403).json({ error: error.message });
        }
        if (error.message.includes('própria pergunta')) {
            return res.status(403).json({ error: error.message });
        }
        console.error('Erro ao votar:', error);
        console.error('Stack trace:', error.stack);
        console.error('Detalhes:', { perguntaId, participanteId });
        return res.status(500).json({ error: 'Erro ao processar voto', detalhes: error.message });
    }
};

// PUT /api/v1/perguntas/:id/responder - Responder pergunta
export const responder = async (req, res) => {
    try {
        const { id } = req.params;
        const { resposta, palestranteNome } = req.body;

        if (!resposta) {
            return res.status(400).json({ error: 'Resposta é obrigatória' });
        }

        const pergunta = await perguntasService.responderPergunta(id, resposta, palestranteNome);

        return res.status(200).json({
            success: true,
            message: 'Resposta registrada',
            data: pergunta
        });
    } catch (error) {
        console.error('Erro ao responder pergunta:', error);
        return res.status(500).json({ error: 'Erro ao responder pergunta' });
    }
};

// GET /api/v1/perguntas/participante/:participanteId/votos - Contar votos
export const contarVotos = async (req, res) => {
    try {
        const { participanteId } = req.params;
        const { palestraId } = req.query;

        if (!palestraId) {
            return res.status(400).json({ error: 'palestraId é obrigatório' });
        }

        const count = await perguntasService.contarVotosParticipante(participanteId, palestraId);

        return res.status(200).json({ count });
    } catch (error) {
        console.error('Erro ao contar votos:', error);
        return res.status(500).json({ error: 'Erro ao contar votos' });
    }
};
