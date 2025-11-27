# Bem vindo(a) ao Connect api 👋

## Para começar:
1. Clone o projeto:

   ```bash
   git clone git@github.com:DennisGabriel-Dev/connect_api.git
   ```

2. Instale as depedências:

   ```bash
   npm install
   ```
3. Inicializar Prisma Client:

   ```bash
   npx prisma generate
   ```

4. Startando o projeto

   ```bash
   npm run start
   ```


## Configuração do projeto
Você irá precisar de um arquivo .env que deve ter esse conteúdo:
```
DATABASE_URL=<URL_MONGO_DB>
```
sugiro que o responsável de cada grupo entre em contato comigo(Dennis) para pegar a credencial do MongoDB.

## Consultar e testar endpoints já existentes
1. Instale a extensão REST Client no VS Code
2. Abra o arquivo `api.rest` na raiz do projeto para testar os endpoints da API de forma prática
3. Clique em "Send Request" acima de cada endpoint para executá-lo

## Regras para criação de endpoints:
Iremos usar o padrão REST, esse [guia](https://www.alura.com.br/artigos/rest-principios-e-boas-praticas) pode ajudar. <br>
A identificação do recurso deve ser feita utilizando-se o conceito de URI (Uniform Resource Identifier) <br>
Usaremos namespaces para a versão da api, sendo: /api/v1 <br>
Exemplos de como as URIs devem ficar:
- http://minha_url.com/api/v1/usuarios;
- http://minha_url.com/api/v1/atividades;
- http://minha_url.com/api/v1/usuarios/12;
- http://minha_url.com/api/v1/perguntas

Obs: para atualizar, deletes ou exibições, iremos delegar aos verbos do HTTP: GET, POST, PUT, PATCH, DELETE.

## Importante:
Para contribuir com a aplicação, abra apenas um PR com todo o código produzido pela equipe.<br>
Sugestão de nomeclatura das branchs: se seu grupo for de QRCode por exemplo, você pode usar a seguinte nomeclatura na branch e PR: ```qr_code-feat-xpto```<br>
Por favor, ao abrir o  Pull Request(PR), faça uma descrição clara do que foi feito com fotos(se tratando de telas construídas). Isso vai facilitar a revisão de código e agilizar o merge.<br>
Exemplo de [PR](https://github.com/DennisGabriel-Dev/connect_api/pull/1)

## Padrão/Estrutura de diretórios para a API:
```
...
src/
  controllers/
    usuariosController.js
    presencaController.js
    ...
  routes/
    usuariosRoutes.js
    presencaRoutes.js
  services/  ## para regras de negócio ou código complexo
    usuariosService.js
  ...
...
```

## Bom desenvolvimento a todos :)
