# ✅ SISTEMA DE PERGUNTAS - BACKEND IMPLEMENTADO

## 📦 ARQUIVOS CRIADOS

### 1. **Schema Prisma** (`prisma/schema.prisma`)
- ✅ Model `Pergunta` (id, texto, status, curtidas, participanteId, palestraId)
- ✅ Model `Curtida` (id, participanteId, perguntaId)
- ✅ Relacionamentos configurados
- ✅ Índices para performance

### 2. **Controller** (`src/controllers/perguntasController.js`)
- ✅ `listarPerguntasPorPalestra` - Lista perguntas aprovadas
- ✅ `listarTodasPerguntas` - Lista todas (admin)
- ✅ `criarPergunta` - Cria nova pergunta
- ✅ `aprovarPergunta` - Aprova pergunta (admin)
- ✅ `rejeitarPergunta` - Rejeita pergunta (admin)
- ✅ `toggleCurtida` - Curte/descurte (máx 3)
- ✅ `obterCurtidasParticipante` - Busca curtidas
- ✅ `deletarPergunta` - Deleta pergunta

### 3. **Rotas** (`src/routes/perguntasRoutes.js`)
- ✅ GET `/api/v1/perguntas/palestra/:palestraId`
- ✅ POST `/api/v1/perguntas`
- ✅ POST `/api/v1/perguntas/:perguntaId/curtir`
- ✅ GET `/api/v1/perguntas/curtidas/:participanteId`
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
3. ✅ Curtir/descurtir perguntas
4. ✅ Limite de 3 curtidas por usuário
5. ✅ Ver suas curtidas e saldo restante
6. ✅ Deletar suas próprias perguntas

### Para Admins:
1. ✅ Ver todas as perguntas (pendentes/aprovadas/rejeitadas)
2. ✅ Filtrar por status
3. ✅ Filtrar por palestra
4. ✅ Aprovar perguntas
5. ✅ Rejeitar perguntas
6. ✅ Deletar qualquer pergunta

### Sistema:
1. ✅ Ordenação automática por curtidas (ranking)
2. ✅ Validação de limite de curtidas
3. ✅ Toggle curtir/descurtir
4. ✅ Relacionamentos entre models
5. ✅ Índices para performance
6. ✅ Cascade delete nas curtidas

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

// Curtir/descurtir
POST /api/v1/perguntas/${perguntaId}/curtir
{ participanteId }

// Ver curtidas
GET /api/v1/perguntas/curtidas/${participanteId}
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
  curtidas: 15,
  criadoEm: "2025-12-06T10:00:00.000Z",
  participanteId: "64abc...",
  palestraId: "64def...",
  participante: { id, nome },
  palestra: { id, titulo },
  curtidasPor: [ { id, participanteId, ... } ]
}
```

### Curtida
```javascript
{
  id: "64xyz...",
  participanteId: "64abc...",
  perguntaId: "64def...",
  criadoEm: "2025-12-06T11:00:00.000Z"
}
```

---

## 🛡️ VALIDAÇÕES IMPLEMENTADAS

✅ Verifica se palestra existe ao criar pergunta  
✅ Verifica se participante existe ao criar pergunta  
✅ Valida limite de 3 curtidas  
✅ Permite descurtir para curtir outra  
✅ Verifica permissões ao deletar  
✅ Valida campos obrigatórios  
✅ Trata erros adequadamente

---

## 🎨 COMPATIBILIDADE COM FRONTEND

As funcionalidades do backend atendem 100% os requisitos do frontend:

✅ Lista de perguntas ordenadas por curtidas  
✅ Sistema de curtir/descurtir  
✅ Limite de 3 curtidas  
✅ Contador de curtidas usadas  
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
- Curtidas limitadas a 3 por participante
- Ordenação automática por número de curtidas
- Admin identificado por `role: "admin"` no model Participante

---

## 🎉 PRONTO PARA USAR!

Todas as partes necessárias do backend foram criadas e estão prontas para integração com o frontend React Native.
