import { getTudoService } from '../services/sorteioService.js';

export async function getTudo(req, res) {
  try {
    const data = await getTudoService(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
