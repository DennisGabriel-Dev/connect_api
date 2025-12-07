# ✅ SISTEMA DE PERGUNTAS - BACKEND IMPLEMENTADO

## 📦 ARQUIVOS CRIADOS

### 1. **Schema Prisma** (`prisma/schema.prisma`)
- ✅ Model `Pergunta` (id, texto, status, participanteId, palestraId, criadoEm)
- ✅ Relacionamentos configurados
- ✅ Índices para performance

### 2. **Controller** (`src/controllers/perguntasController.js`)
- ✅ `listarPerguntasPorPalestra` - Lista perguntas aprovadas
- ✅ `listarTodasPerguntas` - Lista todas (admin)
- ✅ `criarPergunta` - Cria nova pergunta
- ✅ `aprovarPergunta` - Aprova pergunta (admin)
- ✅ `rejeitarPergunta` - Rejeita pergunta (admin)
- ✅ `deletarPergunta` - Deleta pergunta

### 3. **Rotas** (`src/routes/perguntasRoutes.js`)
- ✅ GET `/api/v1/perguntas/palestra/:palestraId`
- ✅ POST `/api/v1/perguntas`
- ✅ GET `/api/v1/perguntas/admin/todas`
- ✅ PATCH `/api/v1/perguntas/:id/aprovar`
- ✅ PATCH `/api/v1/perguntas/:id/rejeitar`
- ✅ DELETE `/api/v1/perguntas/:id`

### 4. **Integração** (`src/app.js`)
- ✅ Rotas de perguntas integradas

### 5. **Documentação**
- ✅ `PERGUNTAS_API.md` - Documentação completa
- ✅ `testes-perguntas.rest` - Exemplos de requisições

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### Para Usuários:
1. ✅ Criar perguntas (status inicial: "pendente")
2. ✅ Ver perguntas aprovadas da palestra
3. ✅ Deletar suas próprias perguntas

### Para Admins:
1. ✅ Ver todas as perguntas (pendentes/aprovadas/rejeitadas)
2. ✅ Filtrar por status
3. ✅ Filtrar por palestra
4. ✅ Aprovar perguntas
5. ✅ Rejeitar perguntas
6. ✅ Deletar qualquer pergunta

### Sistema:
1. ✅ Ordenação por data de criação
2. ✅ Relacionamentos entre models
3. ✅ Índices para performance
4. ✅ Validações de campos obrigatórios

---

## 🔄 PRÓXIMOS PASSOS

### 1. Atualizar Banco de Dados
Execute no terminal:
```bash
npx prisma generate
npx prisma db push
```

### 2. Testar Endpoints
Use o arquivo `testes-perguntas.rest` ou:
- Postman
- Insomnia
- Thunder Client (VS Code)

### 3. Integrar com Frontend
Conecte as telas do React Native com estes endpoints:

**Tela de Perguntas:**
```javascript
// Listar perguntas aprovadas
GET /api/v1/perguntas/palestra/${palestraId}

// Criar pergunta
POST /api/v1/perguntas
{ texto, participanteId, palestraId }
```

**Tela Admin:**
```javascript
// Listar pendentes
GET /api/v1/perguntas/admin/todas?status=pendente

// Aprovar
PATCH /api/v1/perguntas/${id}/aprovar

// Rejeitar
PATCH /api/v1/perguntas/${id}/rejeitar
```

---

## 📊 ESTRUTURA DE DADOS

### Pergunta
```javascript
{
  id: "64xyz...",
  texto: "Como funciona async/await?",
  status: "aprovada", // pendente | aprovada | rejeitada
  criadoEm: "2025-12-06T10:00:00.000Z",
  participanteId: "64abc...",
  palestraId: "64def...",
  participante: { id, nome },
  palestra: { id, titulo }
}
```

---

## 🛡️ VALIDAÇÕES IMPLEMENTADAS

✅ Verifica se palestra existe ao criar pergunta  
✅ Verifica se participante existe ao criar pergunta  
✅ Verifica permissões ao deletar  
✅ Valida campos obrigatórios  
✅ Trata erros adequadamente

---

## 🎨 COMPATIBILIDADE COM FRONTEND

As funcionalidades do backend atendem os requisitos do frontend:

✅ Cadastro de perguntas  
✅ Fluxo de aprovação (pendente → aprovada)  
✅ Tela de moderação admin  
✅ Filtros por status  
✅ Integração com palestras

---

## 🚀 COMO USAR

1. **Instalar dependências** (se necessário):
```bash
npm install
```

2. **Gerar Prisma Client**:
```bash
npx prisma generate
```

3. **Sincronizar com MongoDB**:
```bash
npx prisma db push
```

4. **Iniciar servidor**:
```bash
npm run dev
```

5. **Testar endpoints**:
- Abra `testes-perguntas.rest`
- Use a extensão REST Client do VS Code
- Ou use Postman/Insomnia

---

## 📝 OBSERVAÇÕES

- O sistema usa MongoDB (não-relacional)
- Prisma Client gerencia os relacionamentos
- Status de pergunta: `pendente` | `aprovada` | `rejeitada`
- Ordenação por data de criação
- Admin identificado por `role: "admin"` no model Participante

---

## 🎉 PRONTO PARA USAR!

Sistema simplificado de perguntas com cadastro e moderação administrativa.
