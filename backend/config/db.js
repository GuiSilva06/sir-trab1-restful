const mongoose = require('mongoose');

// Isola a lógica de ligação à base de dados num único sítio.
// server.js só precisa de chamar conectarBD(),
// não precisa de saber como o mongoose funciona por dentro.
async function conectarBD() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Ligado ao MongoDB Atlas');
  } catch (erro) {
    console.error('Falha ao ligar ao MongoDB:', erro.message);
    // Sem base de dados a API não serve para nada,
    // por isso o processo é terminado, em vez de deixar o servidor arrancar "meio-vivo".
    process.exit(1);
  }
}

module.exports = conectarBD;
