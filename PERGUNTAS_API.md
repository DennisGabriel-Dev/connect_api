# 🎯 API DE PERGUNTAS - DOCUMENTAÇÃO

## 📋 ENDPOINTS DISPONÍVEIS

### 1. **Listar Perguntas Aprovadas de uma Palestra**
**GET** `/api/v1/perguntas/palestra/:palestraId`

**Descrição:** Retorna todas as perguntas aprovadas de uma palestra, ordenadas por curtidas (ranking).

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
    "curtidas": 15,
    "criadoEm": "2025-12-06T10:30:00.000Z",
    "participanteId": "64abc123",
    "palestraId": "64abc123def456789",
    "participante": {
      "id": "64abc123",
      "nome": "João Silva"
    },
    "curtidasPor": [
      {
        "id": "64curtida1",
        "participanteId": "64part1",
        "perguntaId": "64xyz789abc123def",
        "criadoEm": "2025-12-06T11:00:00.000Z"
      }
    ]
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
  "curtidas": 0,
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

### 3. **Curtir/Descurtir Pergunta**
**POST** `/api/v1/perguntas/:perguntaId/curtir`

**Descrição:** Curte ou descurte uma pergunta (toggle). Limite: 3 curtidas por usuário.

**Body:**
```json
{
  "participanteId": "64abc123"
}
```

**Resposta ao Curtir (200):**
```json
{
  "message": "Pergunta curtida",
  "curtiu": true,
  "pergunta": {
    "id": "64xyz789abc123def",
    "texto": "Qual a diferença entre Promise e async/await?",
    "curtidas": 16,
    "curtidasPor": [...]
  }
}
```

**Resposta ao Descurtir (200):**
```json
{
  "message": "Curtida removida",
  "curtiu": false,
  "pergunta": {
    "id": "64xyz789abc123def",
    "texto": "Qual a diferença entre Promise e async/await?",
    "curtidas": 15,
    "curtidasPor": [...]
  }
}
```

**Erro - Limite Atingido (400):**
```json
{
  "error": "Limite de 3 curtidas atingido. Remova uma curtida para curtir outra pergunta."
}
```

---

### 4. **Obter Curtidas de um Participante**
**GET** `/api/v1/perguntas/curtidas/:participanteId`

**Descrição:** Retorna as curtidas de um participante e o saldo restante.

**Resposta (200):**
```json
{
  "totalCurtidas": 2,
  "curtidasRestantes": 1,
  "curtidas": [
    {
      "id": "64curtida1",
      "participanteId": "64abc123",
      "perguntaId": "64xyz789",
      "criadoEm": "2025-12-06T11:00:00.000Z",
      "pergunta": {
        "id": "64xyz789",
        "texto": "Como usar async/await?",
        "curtidas": 10,
        "palestra": {
          "id": "64pal1",
          "titulo": "JavaScript Moderno"
        }
      }
    }
  ]
}
```

---

## 🔐 ROTAS ADMINISTRATIVAS

### 5. **Listar Todas as Perguntas (Admin)**
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
    "curtidas": 0,
    "criadoEm": "2025-12-06T09:00:00.000Z",
    "participante": {
      "id": "64abc123",
      "nome": "João Silva",
      "email": "joao@email.com"
    },
    "palestra": {
      "id": "64pal1",
      "titulo": "Node.js Avançado"
    },
    "curtidasPor": []
  }
]
```

---

### 6. **Aprovar Pergunta (Admin)**
**PATCH** `/api/v1/perguntas/:id/aprovar`

**Resposta (200):**
```json
{
  "id": "64xyz789",
  "texto": "Como funciona o event loop?",
  "status": "aprovada",
  "curtidas": 0,
  "participante": {...},
  "palestra": {...}
}
```

---

### 7. **Rejeitar Pergunta (Admin)**
**PATCH** `/api/v1/perguntas/:id/rejeitar`

**Resposta (200):**
```json
{
  "id": "64xyz789",
  "texto": "Como funciona o event loop?",
  "status": "rejeitada",
  "curtidas": 0,
  "participante": {...},
  "palestra": {...}
}
```

---

### 8. **Deletar Pergunta**
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

## 📊 MODELOS DE DADOS

### Pergunta
```typescript
{
  id: string
  texto: string
  status: "pendente" | "aprovada" | "rejeitada"
  curtidas: number
  criadoEm: DateTime
  participanteId: string
  palestraId: string
}
```

### Curtida
```typescript
{
  id: string
  participanteId: string
  perguntaId: string
  criadoEm: DateTime
}
```

---

## 🔄 FLUXO DE USO

### Para Usuários:
1. **Criar pergunta** → POST `/api/v1/perguntas`
2. **Listar perguntas aprovadas** → GET `/api/v1/perguntas/palestra/:id`
3. **Curtir pergunta** → POST `/api/v1/perguntas/:id/curtir`
4. **Verificar curtidas** → GET `/api/v1/perguntas/curtidas/:participanteId`

### Para Admins:
1. **Listar pendentes** → GET `/api/v1/perguntas/admin/todas?status=pendente`
2. **Aprovar** → PATCH `/api/v1/perguntas/:id/aprovar`
3. **Rejeitar** → PATCH `/api/v1/perguntas/:id/rejeitar`

---

## ⚙️ REGRAS DE NEGÓCIO

✅ Perguntas começam como "pendente"  
✅ Apenas perguntas aprovadas aparecem para usuários  
✅ Limite de 3 curtidas por participante  
✅ Pode descurtir para curtir outra  
✅ Ordenação automática por número de curtidas  
✅ Admin pode aprovar/rejeitar/deletar qualquer pergunta  
✅ Usuário só pode deletar suas próprias perguntas
