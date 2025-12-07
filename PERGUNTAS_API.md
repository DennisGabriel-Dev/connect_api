# 🎯 API DE PERGUNTAS - DOCUMENTAÇÃO

## 📋 ENDPOINTS DISPONÍVEIS

### 1. **Listar Perguntas Aprovadas de uma Palestra**
**GET** `/api/v1/perguntas/palestra/:palestraId`

**Descrição:** Retorna todas as perguntas aprovadas de uma palestra.

**Exemplo de Requisição:**
```http
GET http://localhost:5000/api/v1/perguntas/palestra/64abc123def456789
```

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "64xyz789abc123def",
    "texto": "Qual a diferença entre Promise e async/await?",
    "status": "aprovada",
    "criadoEm": "2025-12-06T10:30:00.000Z",
    "participanteId": "64abc123",
    "palestraId": "64abc123def456789",
    "participante": {
      "id": "64abc123",
      "nome": "João Silva"
    }
  }
]
```

---

### 2. **Criar Nova Pergunta**
**POST** `/api/v1/perguntas`

**Descrição:** Cria uma nova pergunta (status inicial: "pendente").

**Body:**
```json
{
  "texto": "Como otimizar consultas no MongoDB?",
  "participanteId": "64abc123",
  "palestraId": "64abc123def456789"
}
```

**Resposta de Sucesso (201):**
```json
{
  "id": "64nova123",
  "texto": "Como otimizar consultas no MongoDB?",
  "status": "pendente",
  "criadoEm": "2025-12-06T12:00:00.000Z",
  "participanteId": "64abc123",
  "palestraId": "64abc123def456789",
  "participante": {
    "id": "64abc123",
    "nome": "João Silva"
  },
  "palestra": {
    "id": "64abc123def456789",
    "titulo": "MongoDB Avançado"
  }
}
```

---

## 🔐 ROTAS ADMINISTRATIVAS

### 3. **Listar Todas as Perguntas (Admin)**
**GET** `/api/v1/perguntas/admin/todas?status=pendente&palestraId=64abc123`

**Query Parameters:**
- `status` (opcional): `pendente`, `aprovada`, `rejeitada`
- `palestraId` (opcional): filtra por palestra específica

**Resposta (200):**
```json
[
  {
    "id": "64xyz789",
    "texto": "Como funciona o event loop?",
    "status": "pendente",
    "criadoEm": "2025-12-06T09:00:00.000Z",
    "participante": {
      "id": "64abc123",
      "nome": "João Silva",
      "email": "joao@email.com"
    },
    "palestra": {
      "id": "64pal1",
      "titulo": "Node.js Avançado"
    }
  }
]
```

---

### 4. **Aprovar Pergunta (Admin)**
**PATCH** `/api/v1/perguntas/:id/aprovar`

**Resposta (200):**
```json
{
  "id": "64xyz789",
  "texto": "Como funciona o event loop?",
  "status": "aprovada",
  "participante": {...},
  "palestra": {...}
}
```

---

### 5. **Rejeitar Pergunta (Admin)**
**PATCH** `/api/v1/perguntas/:id/rejeitar`

**Resposta (200):**
```json
{
  "id": "64xyz789",
  "texto": "Como funciona o event loop?",
  "status": "rejeitada",
  "participante": {...},
  "palestra": {...}
}
```

---

### 6. **Deletar Pergunta**
**DELETE** `/api/v1/perguntas/:id`

**Descrição:** Deleta uma pergunta. Apenas o autor ou admin podem deletar.

**Body:**
```json
{
  "participanteId": "64abc123"
}
```

**Resposta (200):**
```json
{
  "message": "Pergunta deletada com sucesso"
}
```

**Erro - Sem Permissão (403):**
```json
{
  "error": "Sem permissão para deletar esta pergunta"
}
```

---

## 📊 MODELO DE DADOS

### Pergunta
```typescript
{
  id: string
  texto: string
  status: "pendente" | "aprovada" | "rejeitada"
  criadoEm: DateTime
  participanteId: string
  palestraId: string
}
```

---

## 🔄 FLUXO DE USO

### Para Usuários:
1. **Criar pergunta** → POST `/api/v1/perguntas`
2. **Listar perguntas aprovadas** → GET `/api/v1/perguntas/palestra/:id`

### Para Admins:
1. **Listar pendentes** → GET `/api/v1/perguntas/admin/todas?status=pendente`
2. **Aprovar** → PATCH `/api/v1/perguntas/:id/aprovar`
3. **Rejeitar** → PATCH `/api/v1/perguntas/:id/rejeitar`
4. **Deletar** → DELETE `/api/v1/perguntas/:id`

---

## ⚙️ REGRAS DE NEGÓCIO

✅ Perguntas começam como "pendente"  
✅ Apenas perguntas aprovadas aparecem para usuários  
✅ Admin pode aprovar/rejeitar/deletar qualquer pergunta  
✅ Usuário só pode deletar suas próprias perguntas  
✅ Ordenação por data de criação
