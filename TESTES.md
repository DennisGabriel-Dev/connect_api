# 🧪 Guia de Testes - API Connect

## 🚀 Como Rodar o Projeto

### 1️⃣ Verificar se o MongoDB está rodando

**Windows:**
```powershell
# Verificar se o MongoDB está instalado e rodando
mongod --version

# Se não estiver rodando, iniciar o MongoDB
# (Se instalado como serviço)
net start MongoDB

# OU iniciar manualmente
mongod --dbpath C:\data\db
```

**Alternativa: MongoDB Atlas (Nuvem - Recomendado)**
1. Acesse https://www.mongodb.com/cloud/atlas
2. Crie uma conta gratuita
3. Crie um cluster
4. Obtenha a string de conexão
5. Atualize o `.env` com a connection string

### 2️⃣ Instalar Dependências (se necessário)
```powershell
npm install
```

### 3️⃣ Gerar Prisma Client
```powershell
npx prisma generate
```

### 4️⃣ Rodar o Servidor
```powershell
npm run dev
```

**Você deve ver:**
```
[nodemon] starting `node src/app.js`
Servidor rodando na porta 5000
```

---

## 📋 Testar as APIs

### ✅ 1. Testar se o servidor está rodando

**Navegador ou Terminal:**
```
http://localhost:5000
```

**Deve retornar:**
```
API Connect rodando
```

---

## 🔐 API de Usuários e Autenticação

### Criar um Usuário (Participante)
```http
POST http://localhost:5000/api/v1/usuarios
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "123456",
  "even3Id": 12345,
  "foto": "https://exemplo.com/foto.jpg"
}
```

---

## 📚 API de Palestras

### Criar uma Palestra
```http
POST http://localhost:5000/api/v1/palestras
Content-Type: application/json

{
  "titulo": "Introdução ao React Native",
  "descricao": "Aprenda a criar apps mobile",
  "tipo": "workshop",
  "local": "Auditório Principal",
  "even3Id": 1001,
  "horarios": [
    {
      "id_time": 1,
      "date_start": "2025-12-01T14:00:00Z",
      "date_end": "2025-12-01T16:00:00Z"
    }
  ],
  "palestrantes": [
    {
      "even3Id": 5001,
      "nome": "Dr. Maria Santos",
      "foto": "https://exemplo.com/maria.jpg",
      "bio": "Desenvolvedora há 10 anos"
    }
  ]
}
```

### Listar Todas as Palestras
```http
GET http://localhost:5000/api/v1/palestras
```

### Obter uma Palestra Específica
```http
GET http://localhost:5000/api/v1/palestras/{id}
```

---

## ❓ API de Perguntas (NOVO!)

### 1. Criar uma Pergunta
```http
POST http://localhost:5000/api/v1/perguntas
Content-Type: application/json

{
  "texto": "Como posso integrar Firebase no React Native?",
  "participanteId": "ID_DO_PARTICIPANTE_AQUI",
  "participanteNome": "João Silva",
  "palestraId": "ID_DA_PALESTRA_AQUI",
  "palestraTitulo": "Introdução ao React Native"
}
```

### 2. Listar Perguntas de uma Palestra
```http
# Todas as perguntas
GET http://localhost:5000/api/v1/perguntas/palestra/{palestraId}

# Apenas perguntas não respondidas
GET http://localhost:5000/api/v1/perguntas/palestra/{palestraId}?respondidas=false

# Apenas perguntas respondidas
GET http://localhost:5000/api/v1/perguntas/palestra/{palestraId}?respondidas=true
```

### 3. Listar Perguntas de um Participante
```http
GET http://localhost:5000/api/v1/perguntas/participante/{participanteId}
```

### 4. Obter uma Pergunta Específica
```http
GET http://localhost:5000/api/v1/perguntas/{id}
```

### 5. Curtir uma Pergunta
```http
PUT http://localhost:5000/api/v1/perguntas/{id}/curtir
```

### 6. Responder uma Pergunta
```http
PUT http://localhost:5000/api/v1/perguntas/{id}/responder
Content-Type: application/json

{
  "resposta": "Você pode usar o pacote @react-native-firebase/app...",
  "palestranteNome": "Dr. Maria Santos"
}
```

### 7. Deletar uma Pergunta
```http
DELETE http://localhost:5000/api/v1/perguntas/{id}
```

---

## ✅ API de Presença

### Registrar Presença
```http
POST http://localhost:5000/api/v1/presenca
Content-Type: application/json

{
  "participanteId": "ID_DO_PARTICIPANTE",
  "palestraId": "ID_DA_PALESTRA"
}
```

---

## 🧪 Teste Rápido com PowerShell

### Testar servidor rodando:
```powershell
Invoke-WebRequest -Uri http://localhost:5000 -Method GET
```

### Criar uma pergunta (exemplo):
```powershell
$body = @{
    texto = "Esta é uma pergunta de teste?"
    participanteId = "674884a1b2c3d4e5f6a7b8c9"
    participanteNome = "Teste User"
    palestraId = "674884a1b2c3d4e5f6a7b8ca"
    palestraTitulo = "Palestra Teste"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/v1/perguntas -Method POST -Body $body -ContentType "application/json"
```

---

## 🛠️ Ferramentas Recomendadas

1. **Postman** - https://www.postman.com/downloads/
2. **Insomnia** - https://insomnia.rest/download
3. **Thunder Client** (Extensão do VS Code)
4. **REST Client** (Extensão do VS Code) - Use o arquivo `api.rest`

---

## ⚠️ Troubleshooting

### Erro: "app crashed"
- ✅ Verifique se o MongoDB está rodando
- ✅ Verifique se o `.env` está configurado corretamente
- ✅ Execute `npx prisma generate`

### Erro: "Cannot find module"
- ✅ Execute `npm install`

### Erro: "Port 5000 already in use"
- ✅ Mude a porta no arquivo `.env` ou `src/app.js`
- ✅ Ou mate o processo: `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force`

---

## 📱 Fluxo Completo do App

1. **Usuário se cadastra** → POST /api/v1/usuarios
2. **Usuário faz login** → POST /api/v1/auth/login
3. **Lista palestras disponíveis** → GET /api/v1/palestras
4. **Registra presença na palestra** → POST /api/v1/presenca
5. **Faz uma pergunta** → POST /api/v1/perguntas
6. **Curte perguntas de outros** → PUT /api/v1/perguntas/:id/curtir
7. **Palestrante responde** → PUT /api/v1/perguntas/:id/responder
8. **Todos veem as perguntas ao vivo** → GET /api/v1/perguntas/palestra/:id

---

## 🎯 Próximos Passos (Sugestões)

- [ ] Implementar WebSocket para atualização em tempo real
- [ ] Adicionar autenticação JWT nas rotas
- [ ] Implementar middleware de autorização
- [ ] Adicionar paginação nas listagens
- [ ] Criar testes automatizados
- [ ] Adicionar validações mais robustas
- [ ] Implementar sistema de notificações
- [ ] Adicionar moderação de perguntas
