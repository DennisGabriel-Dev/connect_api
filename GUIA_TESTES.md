# Guia de Testes - Sistema de Perguntas com Aprovação

## 📋 Pré-requisitos

Antes de começar os testes, certifique-se de que:

- ✅ Backend rodando (`npm run dev` no `connect_api`)
- ✅ Frontend rodando (`npm start` no `connect_app`)
- ✅ Prisma Studio rodando (`npx prisma studio` no `connect_api`)
- ✅ Banco de dados configurado corretamente no `.env`

---

## 🧪 Teste 1: Preparar Dados de Teste

### Objetivo
Criar perguntas com diferentes status (aprovada, pendente, rejeitada) para validar o filtro.

### Passos

1. **Navegar até o diretório do backend**
   ```bash
   cd c:\Users\slauv\Documents\Git\connect\connect_api
   ```

2. **Executar o script de preparação de dados**
   ```bash
   node scripts/testes/preparar-dados-teste.js
   ```

3. **Resultado esperado**
   ```
   Resetadas para pendente
   ✅ 4 aprovadas
   ❌ 2 rejeitadas
   ⏳ Restantes pendentes
   
   RESULTADO FINAL:
   ✅ Aprovadas: 4
   ⏳ Pendentes: 3
   ❌ Rejeitadas: 2
   ```

### O que esse script faz?
- Marca todas as perguntas da "Palestra 3" como pendentes
- Aprova 4 perguntas
- Rejeita 2 perguntas
- Deixa o restante como pendente

---

## 🧪 Teste 2: Verificar Status no Banco de Dados

### Objetivo
Confirmar que os dados foram criados corretamente no banco.

### Opção A: Usando Script Node.js

1. **Executar o script de verificação**
   ```bash
   node scripts/testes/test-perguntas.js
   ```

2. **Resultado esperado**
   ```
   Total de perguntas: 9
   
   Status das perguntas:
   1. aprovada | Pergunta???...
   2. aprovada | Blablablba...
   3. aprovada | O que acharam?...
   4. aprovada | Minha pergunta???...
   5. rejeitada | Onde você estudou?...
   6. rejeitada | Gostou de palestrar?...
   7. pendente | Qual foi o melhor momento?...
   8. pendente | Pergunta 1 palestra 3...
   9. pendente | Qual tecnologia?...
   
   ✅ Perguntas APROVADAS: 4
   ```

### Opção B: Usando Prisma Studio

1. **Abrir Prisma Studio** (http://localhost:5555)
2. **Clicar em "Pergunta"** no menu lateral
3. **Filtrar por palestraId**: `693736a2346686b58c2c69e8` (Palestra 3)
4. **Verificar a coluna "status"** de cada pergunta

---

## 🧪 Teste 3: Testar Endpoint de Usuário Comum (Apenas Aprovadas)

### Objetivo
Verificar que usuários comuns veem apenas perguntas aprovadas.

### Passo 1: Testar via PowerShell

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/perguntas/palestra/693736a2346686b58c2c69e8" -Method GET

Write-Host "Total de perguntas retornadas: $($response.count)" -ForegroundColor Cyan

Write-Host "`nStatus das perguntas:" -ForegroundColor Yellow
$response.data | ForEach-Object { 
    Write-Host "- $($_.status)" 
}
```

### Resultado Esperado
```
Total de perguntas retornadas: 4

Status das perguntas:
- aprovada
- aprovada
- aprovada
- aprovada
```

### Passo 2: Verificar via Navegador ou Postman

**URL**: `GET http://localhost:5000/api/v1/perguntas/palestra/693736a2346686b58c2c69e8`

**Resposta esperada**:
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": "...",
      "texto": "...",
      "status": "aprovada",
      "curtidas": 1,
      ...
    },
    // ... mais 3 perguntas, todas com status "aprovada"
  ]
}
```

✅ **TESTE PASSOU** se:
- `count` = 4
- Todas as perguntas têm `status: "aprovada"`

---

## 🧪 Teste 4: Testar Endpoint Admin (Todas as Perguntas)

### Objetivo
Verificar que administradores podem ver todas as perguntas.

### Via PowerShell

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/perguntas/admin/todas?palestraId=693736a2346686b58c2c69e8" -Method GET

Write-Host "Total de perguntas: $($response.count)" -ForegroundColor Cyan

Write-Host "`nBreakdown por status:" -ForegroundColor Yellow
$statusCount = @{}
$response.data | ForEach-Object { 
    $statusCount[$_.status] = ($statusCount[$_.status] ?? 0) + 1 
}
$statusCount.GetEnumerator() | ForEach-Object { 
    Write-Host "  $($_.Key): $($_.Value)" 
}
```

### Resultado Esperado
```
Total de perguntas: 9

Breakdown por status:
  aprovada: 4
  pendente: 3
  rejeitada: 2
```

✅ **TESTE PASSOU** se:
- Total = 9 perguntas
- 4 aprovadas + 3 pendentes + 2 rejeitadas

---

## 🧪 Teste 5: Testar no App Mobile (Frontend)

### Objetivo
Verificar que a interface mostra apenas perguntas aprovadas.

### Pré-requisitos
- App rodando no dispositivo/emulador
- Usuário logado (não-admin)

### Passos

1. **Abrir o app**
2. **Navegar para "Programação"** (tab inferior)
3. **Selecionar "Palestra 3"**
4. **Registrar presença** (se ainda não registrou)
5. **Tocar em "Ver Perguntas"**

### Resultado Esperado

✅ A tela deve mostrar:
- **4 perguntas** na lista
- Todas com badge ou indicador visual de "aprovada"
- **NÃO** deve aparecer perguntas pendentes ou rejeitadas

### Verificações Visuais
- [ ] Contador mostra "4 perguntas"
- [ ] Banner "Pergunta mais votada" aparece (se houver votos)
- [ ] Todas as perguntas são visíveis
- [ ] Botão "+ Nova Pergunta" está presente

---

## 🧪 Teste 6: Criar Nova Pergunta (Pendente por Padrão)

### Objetivo
Verificar que novas perguntas iniciam como "pendente" e não aparecem para usuários.

### Passos

1. **No app, tocar em "+ Nova Pergunta"**
2. **Preencher**:
   - Título: "Minha pergunta de teste"
   - Descrição: "Esta é uma pergunta criada para testar o sistema"
3. **Tocar em "Enviar"**
4. **Voltar para a lista de perguntas**

### Resultado Esperado

✅ A nova pergunta **NÃO** aparece na lista (porque está pendente)

### Verificar no Backend

```powershell
# Via script
node scripts/testes/test-perguntas.js

# Ou via Prisma Studio
# Verificar que a pergunta existe com status "pendente"
```

---

## 🧪 Teste 7: Aprovar Pergunta (Admin)

### Objetivo
Verificar que admins podem aprovar perguntas e elas aparecem para usuários.

### Opção A: Via API

```powershell
# Pegar ID de uma pergunta pendente
$perguntas = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/perguntas/admin/todas?palestraId=693736a2346686b58c2c69e8&status=pendente"
$idPendente = $perguntas.data[0].id

# Aprovar
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/perguntas/$idPendente/aprovar" -Method PATCH
```

### Opção B: Via Interface Admin (se implementado)

1. Login como admin
2. Ir para "Gerenciar Perguntas"
3. Filtrar por "Pendentes"
4. Tocar em "Aprovar" na pergunta desejada

### Verificar Resultado

Recarregar a lista de perguntas no app (como usuário comum):
- ✅ A pergunta aprovada agora deve aparecer
- ✅ Total de perguntas visíveis aumentou em 1

---

## 🧪 Teste 8: Sistema de Votação

### Objetivo
Verificar limite de 3 votos e função toggle.

### Passos

1. **Votar em 3 perguntas diferentes**
   - Tocar no ❤️ de cada pergunta
   - Verificar contador "Votos: 1/3", "Votos: 2/3", "Votos: 3/3"

2. **Tentar votar em uma 4ª pergunta**
   - ✅ Deve mostrar alerta: "Limite de votos atingido"
   - ✅ Ícones de voto devem ficar desabilitados/com lock

3. **Remover um voto**
   - Tocar novamente no ❤️ de uma pergunta votada
   - ✅ Contador deve voltar para "Votos: 2/3"
   - ✅ Botões de voto devem ficar habilitados novamente

4. **Votar em outra pergunta**
   - ✅ Deve funcionar normalmente

---

## 📊 Resumo dos Testes

| # | Teste | Comando/Ação | Resultado Esperado |
|---|-------|--------------|-------------------|
| 1 | Preparar dados | `node scripts/testes/preparar-dados-teste.js` | 4 aprovadas, 3 pendentes, 2 rejeitadas |
| 2 | Verificar banco | `node scripts/testes/test-perguntas.js` | Lista correta de status |
| 3 | Endpoint usuário | `GET /palestra/:id` | Retorna 4 (só aprovadas) |
| 4 | Endpoint admin | `GET /admin/todas` | Retorna 9 (todas) |
| 5 | App - listar | Ver Perguntas no app | Mostra 4 perguntas |
| 6 | App - criar | + Nova Pergunta | Não aparece na lista |
| 7 | Aprovar | `PATCH /:id/aprovar` | Aparece para usuários |
| 8 | Votar | Tocar ❤️ 3x | Limite de 3 votos |

---

## 🔧 Troubleshooting

### Problema: Scripts não funcionam
**Solução**: Verificar se está no diretório correto
```bash
cd c:\Users\slauv\Documents\Git\connect\connect_api
```

### Problema: API retorna erro 500
**Solução**: 
1. Verificar se o backend está rodando
2. Verificar conexão com banco de dados
3. Checar logs do terminal do backend

### Problema: Perguntas não aparecem no app
**Solução**:
1. Fazer pull-to-refresh (arrastar para baixo)
2. Verificar se o `palestraId` está correto
3. Confirmar que há presença registrada

### Problema: Não consigo votar
**Solução**:
1. Verificar se tem presença registrada
2. Verificar se não é sua própria pergunta
3. Verificar se não atingiu o limite de 3 votos

### Problema: Erro "dataHora" null ou string no Prisma Studio
**Causa**: Dados antigos ou importados com campo `dataHora` incorreto (null ou string em vez de Date object).

**Solução**: Execute o script de correção:
```bash
node scripts/testes/converter-datahora.js
```

**O que o script faz**:
- Encontra perguntas com `dataHora` null ou como string ISO
- Converte para objetos Date do MongoDB
- Solução definitiva para o erro no Prisma Studio e API

**Quando usar**:
- ❌ Prisma Studio mostra erro ao abrir "Pergunta"
- ❌ API retorna erro 500 ao listar perguntas
- ❌ Mensagem de erro menciona "dataHora" e "DateTime"

**Importante**:
- ⚠️ Novas perguntas criadas pelo app **não precisam** deste script
- ⚠️ O schema Prisma define `dataHora DateTime @default(now())` automaticamente
- ⚠️ Este script é apenas para **correção de dados antigos**

---

## 📝 Notas Importantes

- 🔴 Os scripts de teste usam o `palestraId` fixo: `693736a2346686b58c2c69e8` (Palestra 3)
- 🔴 Para testar com outra palestra, edite os scripts
- 🔴 Scripts modificam dados no banco - use com cuidado em produção
- 🔴 Sempre faça backup do banco antes de testes destrutivos

---

## ✅ Checklist de Testes Completos

- [✅] Dados de teste preparados (script executado)
- [✅] Verificação no banco (Prisma Studio ou script)
- [✅] Endpoint de usuário testado (4 aprovadas)
- [✅] Endpoint admin testado (9 totais)
- [✅] App mostra apenas aprovadas
- [✅] Criação de pergunta (pendente)
- [✅] Aprovação funciona
- [✅] Sistema de votação (limite de 3)
- [✅] Remover voto funciona
- [✅] Pull-to-refresh atualiza lista

**Data do último teste**: 10/12/2025  
**Testado por**: Sávio Henrique  
**Resultado**: ✅ Passou / ❌ Falhou
