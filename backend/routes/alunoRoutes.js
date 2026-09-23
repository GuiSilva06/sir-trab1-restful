const express = require('express');
const router = express.Router();
const {
  listarAlunos,
  obterAluno,
  criarAluno,
  atualizarAluno,
  apagarAluno,
} = require('../controllers/alunoController');

router.get('/', listarAlunos);
router.get('/:id', obterAluno);
router.post('/', criarAluno);
router.put('/:id', atualizarAluno);
router.delete('/:id', apagarAluno);

module.exports = router;
