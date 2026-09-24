const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const definicao = {
  openapi: '3.0.0',
  info: {
    title: 'API de Alunos e Cursos',
    version: '1.0.0',
    description:
      'API RESTful do Trabalho Prático #1 de Sistemas de Informação em Rede - gestão de alunos e cursos, com Node.js, Express, Mongoose e MongoDB Atlas.',
  },
  servers: [
    { url: 'http://localhost:4000', description: 'Servidor local' },
    { url: 'https://sir-trab1-api.onrender.com', description: 'Servidor publicado (Render)' },
  ],
  // Esquemas reutilizáveis, referenciados nas rotas com $ref
  // em vez de repetir a mesma estrutura em cada endpoint.
  components: {
    schemas: {
      Curso: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '671f2a9b3c4d5e6f7a8b9c0d' },
          nomeDoCurso: { type: 'string', example: 'Engenharia Informática' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CursoEntrada: {
        type: 'object',
        required: ['nomeDoCurso'],
        properties: {
          nomeDoCurso: { type: 'string', example: 'Engenharia Informática' },
        },
      },
      Aluno: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '671f2a9b3c4d5e6f7a8b9c0e' },
          nome: { type: 'string', example: 'Joana' },
          apelido: { type: 'string', example: 'Silva' },
          curso: {
            oneOf: [{ $ref: '#/components/schemas/Curso' }, { type: 'null' }],
            description: 'Curso associado, já populado, ou null se não tiver nenhum.',
          },
          anoCurricular: { type: 'integer', example: 2 },
          idade: { type: 'integer', example: 21, nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AlunoEntrada: {
        type: 'object',
        required: ['nome', 'apelido', 'anoCurricular'],
        properties: {
          nome: { type: 'string', example: 'Joana' },
          apelido: { type: 'string', example: 'Silva' },
          curso: {
            type: 'string',
            nullable: true,
            description: '_id de um curso existente, ou null.',
            example: '671f2a9b3c4d5e6f7a8b9c0d',
          },
          anoCurricular: { type: 'integer', example: 2 },
          idade: { type: 'integer', example: 21, nullable: true },
        },
      },
      Erro: {
        type: 'object',
        properties: {
          mensagem: { type: 'string', example: 'Aluno não encontrado.' },
        },
      },
    },
  },
};

const opcoes = {
  definition: definicao,
  // Onde procurar os comentários JSDoc que descrevem cada endpoint.
  // Caminho absoluto (via __dirname) para não depender de onde o processo é arrancado.
  apis: [path.join(__dirname, '../routes/*.js')],
};

module.exports = swaggerJsdoc(opcoes);
