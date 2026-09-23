const Aluno = require('../models/Aluno');

async function listarAlunos(pedido, resposta) {
  try {
    // .populate('curso') troca o ObjectId guardado pelo documento Curso completo,
    // numa só pesquisa, o mesmo que o frontend fazia à mão com cursosCache.find().
    const alunos = await Aluno.find().populate('curso').sort({ nome: 1 });
    resposta.json(alunos);
  } catch (erro) {
    resposta.status(500).json({ mensagem: 'Erro ao obter alunos.', erro: erro.message });
  }
}

async function obterAluno(pedido, resposta) {
  try {
    const aluno = await Aluno.findById(pedido.params.id).populate('curso');
    if (!aluno) return resposta.status(404).json({ mensagem: 'Aluno não encontrado.' });
    resposta.json(aluno);
  } catch (erro) {
    if (erro.name === 'CastError')
      return resposta.status(400).json({ mensagem: 'Id de aluno inválido.' });
    resposta.status(500).json({ mensagem: 'Erro ao obter aluno.', erro: erro.message });
  }
}

async function criarAluno(pedido, resposta) {
  try {
    const novoAluno = await Aluno.create(pedido.body);
    resposta.status(201).json(novoAluno);
  } catch (erro) {
    if (erro.name === 'ValidationError')
      return resposta.status(400).json({ mensagem: erro.message });
    resposta.status(500).json({ mensagem: 'Erro ao criar aluno.', erro: erro.message });
  }
}

async function atualizarAluno(pedido, resposta) {
  try {
    const alunoAtualizado = await Aluno.findByIdAndUpdate(pedido.params.id, pedido.body, {
      new: true,
      runValidators: true,
    }).populate('curso');
    if (!alunoAtualizado) return resposta.status(404).json({ mensagem: 'Aluno não encontrado.' });
    resposta.json(alunoAtualizado);
  } catch (erro) {
    if (erro.name === 'ValidationError')
      return resposta.status(400).json({ mensagem: erro.message });
    if (erro.name === 'CastError') return resposta.status(400).json({ mensagem: 'Id inválido.' });
    resposta.status(500).json({ mensagem: 'Erro ao atualizar aluno.', erro: erro.message });
  }
}

async function apagarAluno(pedido, resposta) {
  try {
    const alunoApagado = await Aluno.findByIdAndDelete(pedido.params.id);
    if (!alunoApagado) return resposta.status(404).json({ mensagem: 'Aluno não encontrado.' });
    resposta.json({ mensagem: 'Aluno apagado.', aluno: alunoApagado });
  } catch (erro) {
    if (erro.name === 'CastError')
      return resposta.status(400).json({ mensagem: 'Id de aluno inválido.' });
    resposta.status(500).json({ mensagem: 'Erro ao apagar aluno.', erro: erro.message });
  }
}

module.exports = { listarAlunos, obterAluno, criarAluno, atualizarAluno, apagarAluno };
