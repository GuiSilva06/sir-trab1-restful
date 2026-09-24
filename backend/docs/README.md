# Backend - API RESTful (Node.js + Express + MongoDB Atlas)

API real que substitui o JSON-Server das Partes 2/3, com a mesma estrutura de endpoints, agora ligada a uma base de dados MongoDB Atlas através do Mongoose, com arquitetura MVC.

**Publicada em:** https://sir-trab1-api.onrender.com

## Estrutura

```
backend/
├── config/
│   └── db.js              # ligação ao MongoDB Atlas
├── controllers/
│   ├── alunoController.js # lógica das operações de Aluno
│   └── cursoController.js # lógica das operações de Curso
├── models/
│   ├── Aluno.js            # schema Mongoose de Aluno
│   └── Curso.js            # schema Mongoose de Curso
├── routes/
│   ├── alunoRoutes.js      # mapeamento de URLs para o controlador de Aluno
│   └── cursoRoutes.js      # mapeamento de URLs para o controlador de Curso
├── scripts/
│   └── migrarDados.js      # migra os dados do /mock-data/bd.json para o Atlas
├── docs/                   # documentação Swagger (Parte 6)
├── .env                    # variáveis de ambiente (não versionado)
└── server.js                # ponto de entrada, liga tudo
```

## Como correr localmente

1. Instalar as dependências:
   ```
   npm install
   ```
2. Criar um ficheiro `.env` nesta pasta com:
   ```
   MONGODB_URI=<a tua connection string do MongoDB Atlas>
   PORT=4000
   ```
3. (Só na primeira vez, ou sempre que quiseres repor os dados originais) migrar os dados do `bd.json`:
   ```
   node scripts/migrarDados.js
   ```
4. Arrancar o servidor em modo desenvolvimento (reinicia sozinho a cada alteração):
   ```
   npm run dev
   ```
   A API fica disponível em `http://localhost:4000`.

## Deploy (Parte 5)

Publicado no Render como Web Service:
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Variáveis de ambiente definidas diretamente no dashboard do Render (não em `.env`, que não é versionado): `MONGODB_URI`, `PORT`

O tier gratuito do Render "adormece" o serviço ao fim de ~15 minutos sem pedidos; o pedido seguinte a um período de inatividade demora 30-60 segundos a responder enquanto o servidor reinicia.

## Endpoints

Todos devolvem e recebem JSON.

| Método | Rota           | Descrição                                             |
| ------ | -------------- | ------------------------------------------------------ |
| GET    | `/alunos`      | Lista todos os alunos (com o curso já populado)        |
| GET    | `/alunos/:id`  | Obtém um aluno pelo `_id`                               |
| POST   | `/alunos`      | Cria um aluno                                           |
| PUT    | `/alunos/:id`  | Atualiza um aluno                                       |
| DELETE | `/alunos/:id`  | Apaga um aluno                                          |
| GET    | `/cursos`      | Lista todos os cursos                                   |
| GET    | `/cursos/:id`  | Obtém um curso pelo `_id`                                |
| POST   | `/cursos`      | Cria um curso                                           |
| PUT    | `/cursos/:id`  | Atualiza um curso                                       |
| DELETE | `/cursos/:id`  | Apaga um curso e desliga (`curso: null`) todos os alunos que lhe estavam associados |

### Corpo esperado

**Aluno** (POST/PUT):
```json
{
  "nome": "Joana",
  "apelido": "Silva",
  "curso": "<_id de um curso existente, ou null>",
  "anoCurricular": 2,
  "idade": 21
}
```
`idade` é opcional. `curso` aceita `null` para representar "sem curso atribuído".

**Curso** (POST/PUT):
```json
{ "nomeDoCurso": "Engenharia Informática" }
```

## Diferenças em relação ao JSON-Server (Partes 2/3)

- O campo `idCurso` (número) passou a `curso` (referência ObjectId ao documento do curso).
- `GET /alunos` e `GET /alunos/:id` devolvem o curso já populado (objeto completo), não só o id.
- Os ids passam a ser strings de 24 caracteres (`_id` do Mongo), não números sequenciais.