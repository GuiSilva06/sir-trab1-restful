# SIR - Trabalho Prático #1: Consumo e Implementação de APIs RESTful

Projeto da unidade curricular de Sistemas de Informação em Rede - gestão de alunos e cursos, com front-end e back-end separados, passando por uma API simulada (JSON-Server) e depois por uma API real (Node.js + Express + MongoDB Atlas).

## Estrutura do repositório

```
projeto-raiz/
├── frontend/      # Interface web (HTML/CSS/JS), consome a API via Fetch
├── backend/        # API RESTful real (Node.js + Express + Mongoose + MongoDB Atlas)
├── mock-server/    # JSON-Server configurado (API simulada, Partes 2/3)
├── mock-data/       # bd.json original
├── tests/          # Coleção de testes Postman
└── README.md        # este ficheiro
```

Cada subpasta tem o seu próprio `README.md` com instruções específicas.

## Estado do trabalho

- [x] **Parte 1** - Base de dados JSON (`mock-data/bd.json`)
- [x] **Parte 2** - API simulada com JSON-Server + testes Postman (`mock-server/`, `tests/`)
- [x] **Parte 3** - Interface web (CRUD de alunos e cursos) (`frontend/`)
- [x] **Parte 4** - API RESTful real com Express + Mongoose (MVC) + MongoDB Atlas (`backend/`)
- [x] **Parte 5** - Deploy da API e do frontend no Render, frontend adaptado para consumir a API real
- [ ] **Parte 6** - Documentação da API com Swagger (`backend/docs/`)

## Links de deploy

- Frontend: https://sir-trab1-frontend.onrender.com
- API: https://sir-trab1-api.onrender.com

Nota: a API está no tier gratuito do Render, que "adormece" ao fim de ~15 minutos sem pedidos. O primeiro pedido a seguir a um período de inatividade pode demorar 30-60 segundos a responder (o servidor está a reiniciar); pedidos seguintes são instantâneos.

## Como correr o projeto localmente

Ver o `README.md` de cada subpasta (`mock-server/`, `backend/`, `frontend/`) para instruções detalhadas de arranque de cada peça.