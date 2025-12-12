import { getTudoService, getDetalhesUsuarioService } from '../services/sorteioService.js';

export async function getTudo(req, res) {
  try {
    console.log('📥 Recebendo requisição de lista de usuários:', JSON.stringify(req.body));
    const data = await getTudoService(req.body);
    console.log(`✅ Retornando ${data.length} usuários`);
    res.json(data);
  } catch (err) {
    console.error('❌ Erro no controller de sorteio:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: err.message || 'Erro ao processar dados de sorteio' });
  }
}

export async function getDetalhesUsuario(req, res) {
  try {
    const { participanteId } = req.params;
    const data = await getDetalhesUsuarioService(participanteId);
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar detalhes do usuário:', err);
    res.status(500).json({ error: err.message || 'Erro ao buscar detalhes do usuário' });
  }
}
