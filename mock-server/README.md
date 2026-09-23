# Mock Server - JSON-Server (Parte 2/3)

API simulada gerada automaticamente pelo JSON-Server a partir de `../mock-data/bd.json`. Usada nas Partes 2 e 3, antes da API real (`../backend/`) da Parte 4.

## Como correr

```
npm install
npm start
```

Fica disponível em `http://localhost:3000`, com rotas REST automáticas para `/alunos` e `/cursos` (GET, POST, PUT, DELETE em `/alunos`; leitura em `/cursos`).

## Servir o frontend a partir daqui

O script `start` inclui a flag `--static ../frontend`, que faz o próprio JSON-Server servir os ficheiros do `/frontend` (HTML/CSS/JS), além de responder à API. Ou seja, correndo só `npm start` aqui e abrindo `http://localhost:3000/` no browser, tens a interface e a API a funcionar na mesma origem, sem precisares de abrir o `index.html` separadamente.

## Endpoints

| Método | Rota          |
| ------ | ------------- |
| GET    | `/alunos`     |
| GET    | `/alunos/:id` |
| POST   | `/alunos`     |
| PUT    | `/alunos/:id` |
| DELETE | `/alunos/:id` |
| GET    | `/cursos`     |
| GET    | `/cursos/:id` |
| POST   | `/cursos`     |
| PUT    | `/cursos/:id` |
| DELETE | `/cursos/:id` |