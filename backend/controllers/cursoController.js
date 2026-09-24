const Curso = require('../models/Curso');
const Aluno = require('../models/Aluno');

async function listarCursos(pedido, resposta) {
  try {
    const cursos = await Curso.find().sort({ nomeDoCurso: 1 });
    resposta.json(cursos);
  } catch (erro) {
    resposta.status(500).json({ mensagem: 'Erro ao obter cursos.', erro: erro.message });
  }
}

async function obterCurso(pedido, resposta) {
  try {
    const curso = await Curso.findById(pedido.params.id);
    if (!curso) return resposta.status(404).json({ mensagem: 'Curso não encontrado.' });
    resposta.json(curso);
  } catch (erro) {
    // CastError acontece quando o :id na URL não tem o formato de um ObjectId válido (ex: "abc")
    if (erro.name === 'CastError')
      return resposta.status(400).json({ mensagem: 'Id de curso inválido.' });
    resposta.status(500).json({ mensagem: 'Erro ao obter curso.', erro: erro.message });
  }
}

async function criarCurso(pedido, resposta) {
  try {
    const novoCurso = await Curso.create(pedido.body);
    resposta.status(201).json(novoCurso);
  } catch (erro) {
    // ValidationError vem do próprio schema (Curso.js) (ex: nome em falta ou demasiado curto)
    if (erro.name === 'ValidationError')
      return resposta.status(400).json({ mensagem: erro.message });
    resposta.status(500).json({ mensagem: 'Erro ao criar curso.', erro: erro.message });
  }
}

async function atualizarCurso(pedido, resposta) {
  try {
    const cursoAtualizado = await Curso.findByIdAndUpdate(pedido.params.id, pedido.body, {
      returnDocument: 'after', // devolve o documento já atualizado, não a versão antiga
      runValidators: true, // sem isto, o findByIdAndUpdate ignoraria as regras do schema
    });
    if (!cursoAtualizado) return resposta.status(404).json({ mensagem: 'Curso não encontrado.' });
    resposta.json(cursoAtualizado);
  } catch (erro) {
    if (erro.name === 'ValidationError')
      return resposta.status(400).json({ mensagem: erro.message });
    if (erro.name === 'CastError')
      return resposta.status(400).json({ mensagem: 'Id de curso inválido.' });
    resposta.status(500).json({ mensagem: 'Erro ao atualizar curso.', erro: erro.message });
  }
}

async function apagarCurso(pedido, resposta) {
  try {
    const cursoApagado = await Curso.findByIdAndDelete(pedido.params.id);
    if (!cursoApagado) return resposta.status(404).json({ mensagem: 'Curso não encontrado.' });

    // Equivalente, do lado do servidor, ao que era feito manualmente no frontend:
    // desligar todos os alunos que apontavam para este curso,
    // em vez de deixar uma referência pendurada a um documento que já não existe.
    // Aqui é uma única operação: o MongoDB trata de atualizar todos os alunos afetados de uma vez.
    await Aluno.updateMany({ curso: cursoApagado._id }, { curso: null });

    resposta.json({ mensagem: 'Curso apagado.', curso: cursoApagado });
  } catch (erro) {
    if (erro.name === 'CastError')
      return resposta.status(400).json({ mensagem: 'Id de curso inválido.' });
    resposta.status(500).json({ mensagem: 'Erro ao apagar curso.', erro: erro.message });
  }
}

module.exports = { listarCursos, obterCurso, criarCurso, atualizarCurso, apagarCurso };
