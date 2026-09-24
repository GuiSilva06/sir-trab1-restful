// URL base da API. Aponta para o backend publicado no Render (Parte 5).
const API_URL = 'https://sir-trab1-api.onrender.com';

// Cursos guardados em memória depois de serem carregados uma vez,
// para não ser preciso pedir ao servidor sempre que a tabela for desenhada.
let cursosCache = [];

// Última lista de alunos recebida da API. A pesquisa filtra esta cópia local
// em vez de fazer um pedido novo ao servidor a cada letra digitada.
let alunosCache = [];

// Referências aos elementos do DOM que serão usadas repetidamente
const tabelaCorpo = document.getElementById('tabela-corpo');
const estadoVazio = document.getElementById('estado-vazio');
const campoBusca = document.getElementById('input-busca');
const formPanel = document.getElementById('form-aluno');
const form = document.getElementById('aluno-form');
const formTitulo = document.getElementById('form-titulo');
const campoId = document.getElementById('aluno-id');
const campoNome = document.getElementById('aluno-nome');
const campoApelido = document.getElementById('aluno-apelido');
const campoCurso = document.getElementById('aluno-curso');
const campoAno = document.getElementById('aluno-ano');
const campoIdade = document.getElementById('aluno-idade');

const dialogOverlay = document.getElementById('dialog-overlay');
const dialogMensagem = document.getElementById('dialog-mensagem');
const dialogCancelar = document.getElementById('dialog-cancelar');
const dialogConfirmar = document.getElementById('dialog-confirmar');

// Elementos da secção de cursos (mesmo padrão da secção de alunos)
const tabelaCursosCorpo = document.getElementById('tabela-cursos-corpo');
const estadoVazioCursos = document.getElementById('estado-vazio-cursos');
const formPanelCurso = document.getElementById('form-curso');
const formCurso = document.getElementById('curso-form');
const formCursoTitulo = document.getElementById('form-curso-titulo');
const campoCursoId = document.getElementById('curso-id');
const campoCursoNome = document.getElementById('curso-nome');
const campoBuscaCursos = document.getElementById('input-busca-cursos');

// ---------- Pedidos à API, com resiliência a falhas transitórias ----------

// Substitui o fetch() nu em todo o ficheiro. Faz duas coisas que o fetch() sozinho não faz:
// (1) trata um código de erro HTTP (404, 500...) como um erro de verdade;
// (2) repete automaticamente pedidos que falharam por falha de rede.
async function apiFetch(url, opcoes = {}, tentativas = 3) {
  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    try {
      const resposta = await fetch(url, opcoes);
      if (!resposta.ok) {
        throw new Error(`${opcoes.method || 'GET'} ${url} devolveu HTTP ${resposta.status}`);
      }
      return resposta;
    } catch (erro) {
      const eErroDeRede = erro instanceof TypeError;
      if (!eErroDeRede || tentativa === tentativas) throw erro;
      await new Promise((resolve) => setTimeout(resolve, 300 * tentativa));
    }
  }
}

// ---------- Carregar dados da API ----------

async function carregarCursos() {
  const resposta = await apiFetch(`${API_URL}/cursos`);
  cursosCache = await resposta.json();
  preencherSelectCursos();
  aplicarFiltroCursos();
}

async function carregarAlunos() {
  const resposta = await apiFetch(`${API_URL}/alunos`);
  alunosCache = await resposta.json();
  aplicarFiltro();
  // A contagem "Nº de Alunos" da tabela de cursos depende de alunosCache,
  // por isso tem de ser recalculada sempre que os alunos mudam, não só os cursos.
  aplicarFiltroCursos();
}

// ---------- Desenhar na página ----------

// Antes precisava de ir procurar o curso em cursosCache a partir de um id numérico.
// Agora o backend já devolve o curso completo (via .populate()), ou null se o aluno não tiver curso associado.
// Por isso esta função passa a receber o próprio objeto curso (ou null), não um id.
function nomeDoCurso(curso) {
  return curso ? curso.nomeDoCurso : 'Curso não definido';
}

// Devolve o HTML da célula "Curso": texto normal se o aluno tiver um curso associado,
// ou o mesmo texto com ícone de aviso a vermelho se curso for null (ex: o curso foi entretanto apagado).
function celulaCurso(curso) {
  if (curso) return nomeDoCurso(curso);

  return `<span class="curso-aviso">
    <svg class="icone-aviso" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2 L18 17 H2 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"></path>
      <line x1="10" y1="8" x2="10" y2="11.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"></line>
      <circle cx="10" cy="14" r="0.9" fill="currentColor"></circle>
    </svg>
    ${nomeDoCurso(curso)}
  </span>`;
}

function preencherSelectCursos() {
  // A opção em branco representa "sem curso atribuído".
  // Sem ela, editar um aluno órfão mostraria sempre o primeiro curso da lista pré-selecionado.
  const opcaoVazia = '<option value="">Sem curso atribuído</option>';
  campoCurso.innerHTML =
    opcaoVazia +
    cursosCache.map((c) => `<option value="${c._id}">${c.nomeDoCurso}</option>`).join('');
}

// Remove acentos e baixa para minúsculas, para "joao" encontrar "João"
// e "informatica" encontrar "Informática".
function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function filtrarAlunos(termo) {
  const termoNormalizado = normalizarTexto(termo.trim());
  if (!termoNormalizado) return alunosCache;

  return alunosCache.filter((aluno) => {
    const camposPesquisaveis = `${aluno.nome} ${aluno.apelido} ${nomeDoCurso(aluno.curso)}`;
    return normalizarTexto(camposPesquisaveis).includes(termoNormalizado);
  });
}

// Ponto único que liga "o que está na cache" a "o que aparece na tabela",
// chamado sempre que os dados mudam (carregarAlunos) ou o termo de busca muda.
function aplicarFiltro() {
  renderizarTabela(filtrarAlunos(campoBusca.value));
}

function renderizarTabela(alunos) {
  estadoVazio.hidden = alunos.length > 0;
  if (alunos.length === 0) {
    const termo = campoBusca.value.trim();
    estadoVazio.textContent = termo
      ? `Nenhum aluno encontrado para "${termo}".`
      : 'Ainda não há alunos registados.';
  }

  // <tbody> inteiramente reconstruído a cada carregamento
  tabelaCorpo.innerHTML = alunos
    .map(
      (aluno) => `
    <tr>
      <td data-label="Nome">${aluno.nome}</td>
      <td data-label="Apelido">${aluno.apelido}</td>
      <td data-label="Curso">${celulaCurso(aluno.curso)}</td>
      <td data-label="Ano">${aluno.anoCurricular}</td>
      <td data-label="Idade">${aluno.idade ?? '-'}</td>
      <td class="col-acoes">
        <div class="acoes-cel">
          <button class="btn-icone editar" data-id="${aluno._id}" type="button">Editar</button>
          <button class="btn-icone apagar" data-id="${aluno._id}" type="button">Apagar</button>
        </div>
      </td>
    </tr>`,
    )
    .join('');
}

function filtrarCursos(termo) {
  const termoNormalizado = normalizarTexto(termo.trim());
  if (!termoNormalizado) return cursosCache;

  return cursosCache.filter((curso) =>
    normalizarTexto(curso.nomeDoCurso).includes(termoNormalizado),
  );
}

function aplicarFiltroCursos() {
  renderizarTabelaCursos(filtrarCursos(campoBuscaCursos.value));
}

function renderizarTabelaCursos(cursos) {
  estadoVazioCursos.hidden = cursos.length > 0;
  if (cursos.length === 0) {
    const termo = campoBuscaCursos.value.trim();
    estadoVazioCursos.textContent = termo
      ? `Nenhum curso encontrado para "${termo}".`
      : 'Ainda não há cursos registados.';
  }

  tabelaCursosCorpo.innerHTML = cursos
    .map((curso) => {
      // Contagem calculada a partir da cache de alunos já carregada.
      // Como aluno.curso vem populado (objeto completo ou null),
      // compara-se pelo _id do curso desse objeto, não por um id numérico como antes.
      const numeroAlunos = alunosCache.filter(
        (aluno) => aluno.curso && aluno.curso._id === curso._id,
      ).length;

      return `
    <tr>
      <td data-label="Nome do curso">${curso.nomeDoCurso}</td>
      <td data-label="Nº de Alunos">${numeroAlunos}</td>
      <td class="col-acoes">
        <div class="acoes-cel">
          <button class="btn-icone editar-curso" data-id="${curso._id}" type="button">Editar</button>
          <button class="btn-icone apagar apagar-curso" data-id="${curso._id}" type="button">Apagar</button>
        </div>
      </td>
    </tr>`;
    })
    .join('');
}

// ---------- Validação do formulário ----------

// Só letras (incluindo acentuadas), espaços, apóstrofos e hífens.
// Cobre nomes como "Ana-Maria" ou "D'Ávila" sem permitir números ou outros caracteres especiais.
const REGEX_NOME = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

// Como no nome/apelido, mas com pontuação comum em nomes de cursos:
// vírgula, apóstrofo, "&", parênteses e barra.
const REGEX_CURSO = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ ,'&()/-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

function validarNome(valor) {
  const limpo = valor.trim();
  if (!limpo) return 'O nome é obrigatório.';
  if (!REGEX_NOME.test(limpo)) return 'Só são permitidas letras, espaços, apóstrofos e hífens.';
  return '';
}

function validarApelido(valor) {
  const limpo = valor.trim();
  if (!limpo) return 'O apelido é obrigatório.';
  if (!REGEX_NOME.test(limpo)) return 'Só são permitidas letras, espaços, apóstrofos e hífens.';
  return '';
}

function validarCurso(valor) {
  if (!valor) return 'Escolhe um curso.';
  return '';
}

function validarAno(valor) {
  const numero = Number(valor);
  if (!valor) return 'O ano curricular é obrigatório.';
  if (!Number.isInteger(numero) || numero < 1 || numero > 5)
    return 'Tem de ser um número inteiro entre 1 e 5.';
  return '';
}

function validarIdade(valor) {
  if (!valor) return ''; // campo opcional: vazio é válido
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 15 || numero > 99)
    return 'Tem de ser um número inteiro entre 15 e 99.';
  return '';
}

function validarNomeCurso(valor) {
  const limpo = valor.trim();
  if (!limpo) return 'O nome do curso é obrigatório.';
  if (limpo.length < 3) return 'Tem de ter pelo menos 3 caracteres.';
  if (!REGEX_CURSO.test(limpo))
    return 'Não são permitidos números nem símbolos fora de , & ( ) / e hífen.';
  return '';
}

// Aplica um validador a um campo: escreve/limpa a mensagem de erro associada
// e alterna a classe "invalido" usada pelo CSS. Devolve true se o campo for válido.
function aplicarValidacao(campo, mensagemErro) {
  const spanErro = document.getElementById(`erro-${campo.id.replace('aluno-', '')}`);
  const valido = mensagemErro === '';
  spanErro.textContent = mensagemErro;
  campo.classList.toggle('invalido', !valido);
  return valido;
}

function validarFormulario() {
  const nomeValido = aplicarValidacao(campoNome, validarNome(campoNome.value));
  const apelidoValido = aplicarValidacao(campoApelido, validarApelido(campoApelido.value));
  const cursoValido = aplicarValidacao(campoCurso, validarCurso(campoCurso.value));
  const anoValido = aplicarValidacao(campoAno, validarAno(campoAno.value));
  const idadeValida = aplicarValidacao(campoIdade, validarIdade(campoIdade.value));

  return nomeValido && apelidoValido && cursoValido && anoValido && idadeValida;
}

function limparErros() {
  document.querySelectorAll('.erro-campo').forEach((span) => (span.textContent = ''));
  document.querySelectorAll('.invalido').forEach((campo) => campo.classList.remove('invalido'));
}

// ---------- Abrir/fechar o formulário ----------

function abrirFormularioNovo() {
  form.reset();
  limparErros();
  campoId.value = ''; // vazio = modo "criar"
  formTitulo.textContent = 'Novo aluno';
  formPanel.hidden = false;
}

function abrirFormularioEdicao(aluno) {
  limparErros();
  campoId.value = aluno._id; // preenchido = modo "editar"
  campoNome.value = aluno.nome;
  campoApelido.value = aluno.apelido;
  // aluno.curso vem populado (objeto) ou null. O <select> precisa só do _id.
  campoCurso.value = aluno.curso ? aluno.curso._id : '';
  campoAno.value = aluno.anoCurricular;
  campoIdade.value = aluno.idade ?? '';
  formTitulo.textContent = `Editar ${aluno.nome} ${aluno.apelido}`;
  formPanel.hidden = false;

  formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  formPanel.classList.remove('destaque');
  void formPanel.offsetWidth;
  formPanel.classList.add('destaque');
}

function fecharFormulario() {
  form.reset();
  limparErros();
  formPanel.hidden = true;
}

function abrirFormularioCursoNovo() {
  formCurso.reset();
  limparErros();
  campoCursoId.value = '';
  formCursoTitulo.textContent = 'Novo curso';
  formPanelCurso.hidden = false;
}

function abrirFormularioCursoEdicao(curso) {
  limparErros();
  campoCursoId.value = curso._id;
  campoCursoNome.value = curso.nomeDoCurso;
  formCursoTitulo.textContent = `Editar ${curso.nomeDoCurso}`;
  formPanelCurso.hidden = false;

  formPanelCurso.scrollIntoView({ behavior: 'smooth', block: 'start' });
  formPanelCurso.classList.remove('destaque');
  void formPanelCurso.offsetWidth;
  formPanelCurso.classList.add('destaque');
}

function fecharFormularioCurso() {
  formCurso.reset();
  limparErros();
  formPanelCurso.hidden = true;
}

// ---------- Modal de confirmação ----------

function abrirConfirmacao(mensagem) {
  dialogMensagem.textContent = mensagem;
  dialogOverlay.hidden = false;

  return new Promise((resolve) => {
    function limpar(resultado) {
      dialogOverlay.hidden = true;
      dialogConfirmar.removeEventListener('click', aoConfirmar);
      dialogCancelar.removeEventListener('click', aoCancelar);
      resolve(resultado);
    }
    function aoConfirmar() {
      limpar(true);
    }
    function aoCancelar() {
      limpar(false);
    }
    dialogConfirmar.addEventListener('click', aoConfirmar);
    dialogCancelar.addEventListener('click', aoCancelar);
  });
}

// ---------- Criar / Editar / Apagar ----------

async function guardarAluno(evento) {
  evento.preventDefault();

  if (!validarFormulario()) return;

  const aluno = {
    nome: campoNome.value.trim(),
    apelido: campoApelido.value.trim(),
    // Já não é preciso Number(...): o valor do <select> é o _id do curso (uma string),
    // não um número. "|| null" cobre a opção "Sem curso atribuído", que fica com value="".
    curso: campoCurso.value || null,
    anoCurricular: Number(campoAno.value),
    idade: campoIdade.value.trim() ? Number(campoIdade.value) : undefined,
  };

  const idExistente = campoId.value;

  try {
    if (idExistente) {
      // Já não é enviado "id" no corpo.
      // O Mongo identifica o documento pelo _id que já vai na própria URL do pedido.
      await apiFetch(`${API_URL}/alunos/${idExistente}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aluno),
      });
    } else {
      await apiFetch(`${API_URL}/alunos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aluno),
      });
    }

    fecharFormulario();
    await carregarAlunos();
  } catch (erro) {
    console.error('Erro ao guardar aluno:', erro);
    alert('Não foi possível guardar o aluno. Vê a consola (F12) para mais detalhes.');
  }
}

async function apagarAluno(id) {
  const confirmado = await abrirConfirmacao(
    'Tens a certeza que queres apagar este aluno? Esta ação não pode ser desfeita.',
  );
  if (!confirmado) return;

  try {
    await apiFetch(`${API_URL}/alunos/${id}`, { method: 'DELETE' });
    await carregarAlunos();
  } catch (erro) {
    console.error('Erro ao apagar aluno:', erro);
    alert('Não foi possível apagar o aluno. Vê a consola (F12) para mais detalhes.');
  }
}

async function guardarCurso(evento) {
  evento.preventDefault();

  const valido = aplicarValidacao(campoCursoNome, validarNomeCurso(campoCursoNome.value));
  if (!valido) return;

  const curso = { nomeDoCurso: campoCursoNome.value.trim() };
  const idExistente = campoCursoId.value;

  try {
    if (idExistente) {
      await apiFetch(`${API_URL}/cursos/${idExistente}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(curso),
      });
    } else {
      await apiFetch(`${API_URL}/cursos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(curso),
      });
    }

    fecharFormularioCurso();
    await carregarCursos();
    await carregarAlunos();
  } catch (erro) {
    console.error('Erro ao guardar curso:', erro);
    alert('Não foi possível guardar o curso. Vê a consola (F12) para mais detalhes.');
  }
}

async function apagarCurso(id) {
  // Contagem só para a mensagem do modal. A desassociação em si já não é feita aqui:
  // o backend trata disso sozinho (updateMany no cursoController),
  // por isso já não há um "for" a fazer PUT aluno a aluno como no mock-server.
  const numeroAfetados = alunosCache.filter(
    (aluno) => aluno.curso && aluno.curso._id === id,
  ).length;

  const mensagem =
    numeroAfetados > 0
      ? `Este curso tem ${numeroAfetados} aluno(s) associado(s). Vão ficar sem curso atribuído. Continuar?`
      : 'Tens a certeza que queres apagar este curso?';

  const confirmado = await abrirConfirmacao(mensagem);
  if (!confirmado) return;

  try {
    await apiFetch(`${API_URL}/cursos/${id}`, { method: 'DELETE' });
    await carregarCursos();
    await carregarAlunos();
  } catch (erro) {
    console.error('Erro ao apagar curso:', erro);
    alert('Não foi possível apagar o curso. Vê a consola (F12) para mais detalhes.');
  }
}

// ---------- Ligações dos eventos ----------

document.getElementById('btn-novo-aluno').addEventListener('click', abrirFormularioNovo);
document.getElementById('btn-cancelar').addEventListener('click', fecharFormulario);
form.addEventListener('submit', guardarAluno);
campoBusca.addEventListener('input', aplicarFiltro);

document.getElementById('btn-novo-curso').addEventListener('click', abrirFormularioCursoNovo);
document.getElementById('btn-cancelar-curso').addEventListener('click', fecharFormularioCurso);
formCurso.addEventListener('submit', guardarCurso);
campoBuscaCursos.addEventListener('input', aplicarFiltroCursos);

// Delegação de eventos: um único listener no <tbody>, em vez de um por botão.
// Os ids passam a ser strings (_id do Mongo), por isso já não há Number(...) aqui.
tabelaCorpo.addEventListener('click', async (evento) => {
  const botao = evento.target.closest('button');
  if (!botao) return;

  const id = botao.dataset.id;

  if (botao.classList.contains('apagar')) {
    await apagarAluno(id);
    return;
  }

  if (botao.classList.contains('editar')) {
    const resposta = await apiFetch(`${API_URL}/alunos/${id}`);
    const aluno = await resposta.json();
    abrirFormularioEdicao(aluno);
  }
});

tabelaCursosCorpo.addEventListener('click', async (evento) => {
  const botao = evento.target.closest('button');
  if (!botao) return;

  const id = botao.dataset.id;

  if (botao.classList.contains('apagar-curso')) {
    await apagarCurso(id);
    return;
  }

  if (botao.classList.contains('editar-curso')) {
    const resposta = await apiFetch(`${API_URL}/cursos/${id}`);
    const curso = await resposta.json();
    abrirFormularioCursoEdicao(curso);
  }
});

// ---------- Arranque ----------

(async function iniciar() {
  await carregarCursos();
  await carregarAlunos();
})();
