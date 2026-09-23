const mongoose = require('mongoose');

const alunoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome é obrigatório.'],
      trim: true,
      // Mesma regra do frontend: só letras, espaços, apóstrofos e hífens.
      match: [
        /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/,
        'Só são permitidas letras, espaços, apóstrofos e hífens.',
      ],
    },
    apelido: {
      type: String,
      required: [true, 'O apelido é obrigatório.'],
      trim: true,
      match: [
        /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/,
        'Só são permitidas letras, espaços, apóstrofos e hífens.',
      ],
    },
    // Referência ao documento Curso pelo seu _id
    // (não é o curso em si, é só o "endereço" onde ele está guardado).
    // "ref: 'Curso'" é o que permite ao Mongoose ir lá buscar o documento completo com .populate('curso').
    // default: null cobre exatamente o caso resolvido manualmente no frontend
    // (um aluno pode ficar sem curso associado - curso apagado).
    curso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Curso',
      default: null,
    },
    anoCurricular: {
      type: Number,
      required: [true, 'O ano curricular é obrigatório.'],
      min: [1, 'O ano curricular tem de estar entre 1 e 5.'],
      max: [5, 'O ano curricular tem de estar entre 1 e 5.'],
    },
    // Sem "required". Tal como no frontend, é um campo opcional.
    idade: {
      type: Number,
      min: [15, 'A idade tem de estar entre 15 e 99.'],
      max: [99, 'A idade tem de estar entre 15 e 99.'],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Aluno', alunoSchema);
