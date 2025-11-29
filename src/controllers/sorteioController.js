import { getTudoService } from '../services/sorteioService.js';

export async function getTudo(req, res) {
  try {
    const data = await getTudoService(req.body);
    res.json(data);
  } catch (err) {
    console.error('Erro no controller de sorteio:', err);
    res.status(500).json({ error: err.message || 'Erro ao processar dados de sorteio' });
  }
}
