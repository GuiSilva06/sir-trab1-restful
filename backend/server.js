// dotenv.config() tem de correr ANTES de qualquer código que use process.env.
// É isto que lê o ficheiro .env e disponibiliza as suas variáveis.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const conectarBD = require('./config/db');
const cursoRoutes = require('./routes/cursoRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const swaggerSpec = require('./docs/swagger');

const app = express();
const PORTA = process.env.PORT || 4000;

// cors() sem argumentos permite pedidos de qualquer origem.
// Na Parte 5, depois do deploy, restringir à origem real do frontend publicado.
app.use(cors());

// Sem isto, pedido.body chegaria sempre undefined nos controladores.
// É este middleware que lê o corpo JSON de um POST/PUT e o disponibiliza.
app.use(express.json());

app.use('/cursos', cursoRoutes);
app.use('/alunos', alunoRoutes);

// A documentação interativa: lê a especificação gerada a partir dos
// comentários JSDoc nas rotas (docs/swagger.js) e serve a página do Swagger UI.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (pedido, resposta) => {
  resposta.send('API de Alunos e Cursos a funcionar. Documentação em /api-docs.');
});

conectarBD().then(() => {
  app.listen(PORTA, () => {
    console.log(`Servidor à escuta em http://localhost:${PORTA}`);
    console.log(`Documentação Swagger em http://localhost:${PORTA}/api-docs`);
  });
});
