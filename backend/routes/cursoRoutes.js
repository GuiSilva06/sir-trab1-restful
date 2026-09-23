const express = require('express');
const router = express.Router();
const {
  listarCursos,
  obterCurso,
  criarCurso,
  atualizarCurso,
  apagarCurso,
} = require('../controllers/cursoController');

// Os caminhos aqui são relativos a onde este router for "montado" no server.js
// (vai ser montado em /cursos, por isso '/' aqui corresponde a GET /cursos).
router.get('/', listarCursos);
router.get('/:id', obterCurso);
router.post('/', criarCurso);
router.put('/:id', atualizarCurso);
router.delete('/:id', apagarCurso);

module.exports = router;
