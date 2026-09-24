# Testes - Coleção Postman

`tests/postman-collection.json` - coleção exportada do Postman com os testes manuais feitos à API simulada (`../mock-server/`, Parte 2): CRUD completo de alunos (GET, POST, PUT, DELETE) e leitura de cursos (GET).

## Como importar

No Postman: **File → Import** → selecionar `postman-collection.json`.

Precisa de um Environment com a variável `baseUrl` definida:
- `http://localhost:3000` para testar contra o `mock-server/` (JSON-Server, Partes 2/3)
- `http://localhost:4000` para testar contra o `backend/` local (API real, Parte 4) - atenção que os nomes dos campos mudam (`idCurso` → `curso`, ver `backend/README.md`)
- `https://sir-trab1-api.onrender.com` para testar contra a API publicada (Parte 5)