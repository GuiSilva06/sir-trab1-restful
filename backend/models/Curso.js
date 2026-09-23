const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema(
  {
    nomeDoCurso: {
      type: String,
      required: [true, 'O nome do curso é obrigatório.'],
      trim: true,
      minlength: [3, 'O nome do curso tem de ter pelo menos 3 caracteres.'],
    },
  },
  {
    // Adiciona createdAt/updatedAt automaticamente a cada documento,
    // útil para saber quando um curso foi criado ou editado, sem esforço extra.
    timestamps: true,
  },
);

module.exports = mongoose.model('Curso', cursoSchema);
