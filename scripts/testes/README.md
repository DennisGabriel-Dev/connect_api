# Scripts de Teste - Sistema de Perguntas

Scripts auxiliares para testar e preparar dados do sistema de perguntas.

## 📋 Scripts Disponíveis

### `test-perguntas.js`

Verifica o status das perguntas no banco de dados.

**Uso:**
```bash
node scripts/testes/test-perguntas.js
```

**Funcionalidade:**
- Lista todas as perguntas de uma palestra específica
- Mostra o status de cada pergunta (aprovada/pendente/rejeitada)
- Conta quantas perguntas estão aprovadas

---

### `preparar-dados-teste.js`

Prepara dados de teste com diferentes status para validação do sistema.

**Uso:**
```bash
node scripts/testes/preparar-dados-teste.js
```

**Funcionalidade:**
- Reseta todas as perguntas para status "pendente"
- Aprova 4 perguntas
- Rejeita 2 perguntas
- Deixa o restante como pendente
- Exibe contagem final por status

---

## 🎯 Casos de Uso

**Testar filtragem de perguntas:**
1. Execute `preparar-dados-teste.js` para criar dados consistentes
2. Execute `test-perguntas.js` para verificar os status
3. Teste a API ou o app para confirmar que apenas aprovadas aparecem

**Debug de problemas:**
1. Use `test-perguntas.js` para ver o estado atual do banco
2. Identifique discrepâncias entre banco e interface
3. Use `preparar-dados-teste.js` para resetar para estado conhecido

---

## ⚠️ Atenção

Estes scripts modificam dados no banco de dados. Use com cuidado em ambientes de produção.
