// Script de execução única corrido manualmente com `node scripts/migrarDados.js`,
// Lê o bd.json da Parte 1 e recria os mesmos dados no MongoDB Atlas,
// com as referências entre aluno e curso já no formato certo.

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Curso = require('../models/Curso');
const Aluno = require('../models/Aluno');

async function migrar() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Ligado à base de dados para migração.');

  const caminhoJson = path.join(__dirname, '../../mock-data/bd.json');
  const dados = JSON.parse(fs.readFileSync(caminhoJson, 'utf-8'));

  // Limpa as coleções antes de migrar para não duplicar dados
  await Curso.deleteMany({});
  await Aluno.deleteMany({});
  console.log('Coleções existentes limpas.');

  // Mapa "id numérico antigo do bd.json" → "ObjectId novo do Mongo".
  // É a peça que faz a ponte entre os dois formatos de referência.
  const mapaCursos = new Map();

  for (const curso of dados.cursos) {
    const novoCurso = await Curso.create({ nomeDoCurso: curso.nomeDoCurso });
    mapaCursos.set(curso.id, novoCurso._id);
  }
  console.log(`${dados.cursos.length} curso(s) migrado(s).`);

  let alunosMigrados = 0;
  for (const aluno of dados.alunos) {
    await Aluno.create({
      nome: aluno.nome,
      apelido: aluno.apelido,
      // mapaCursos.get(...) devolve undefined se o idCurso do aluno não corresponder
      // a nenhum curso migrado (ex: um aluno órfão que já estava no bd.json).
      // O "?? null" garante que fica explicitamente "sem curso" em vez de undefined.
      curso: mapaCursos.get(aluno.idCurso) ?? null,
      anoCurricular: aluno.anoCurricular,
      idade: aluno.idade,
    });
    alunosMigrados++;
  }
  console.log(`${alunosMigrados} aluno(s) migrado(s).`);

  await mongoose.disconnect();
  console.log('Migração concluída, ligação fechada.');
}

migrar().catch((erro) => {
  console.error('Erro na migração:', erro);
  process.exit(1);
});
