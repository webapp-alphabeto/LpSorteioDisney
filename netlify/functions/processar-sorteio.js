// processar-sorteio.js
const busboy = require('busboy');
const { query } = require('./utils/db-mssql');
const { gerarCodigoUnico, calcularQuantidadeCodigos } = require('./utils/app-utils');
const { uploadNotaFiscalAzure } = require('./utils/storage-azure');
const { enviarEmailCodigos } = require('./utils/email');
const { adicionarEmailNaFila } = require('./utils/email-queue');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  try {
    const formData = await parseMultipartForm(event);
    const required = ['nome','cpf','dataNascimento','endereco','email','celular','numeroNota','valorCompra'];
    for (const f of required) {
      if (!formData.fields[f]) {
        return { statusCode: 400, body: JSON.stringify({ error: `Campo ${f} é obrigatório` }) };
      }
    }
    if (!formData.files.notaFiscal) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Nota fiscal é obrigatória' }) };
    }

    const dados = formData.fields;
    const arquivo = formData.files.notaFiscal;

    // 1) Upsert usuário por CPF
    let rows = await query('SELECT TOP(1) * FROM usuarios WHERE cpf=$1', [dados.cpf]);
    let usuario = rows[0];
    if (usuario) {
      await query(`
        UPDATE usuarios SET nome=$1,email=$2,celular=$3,endereco=$4,updated_at=SYSDATETIME() WHERE id=$5
      `, [dados.nome, dados.email, dados.celular, dados.endereco, usuario.id]);
    } else {
      rows = await query(`
        INSERT INTO usuarios (nome, cpf, data_nascimento, endereco, email, celular)
        OUTPUT INSERTED.*
        VALUES ($1,$2,$3,$4,$5,$6)
      `, [dados.nome, dados.cpf, dados.dataNascimento, dados.endereco, dados.email, dados.celular]);
      usuario = rows[0];
    }
    const usuario_id = usuario.id;

    // 2) Nota fiscal única
    const exists = await query('SELECT TOP(1) 1 FROM participacoes WHERE numero_nota=$1', [dados.numeroNota]);
    if (exists.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Esta nota fiscal já foi utilizada' }) };
    }

    // 3) Upload nota na Azure
    const urlArquivo = await uploadNotaFiscalAzure(arquivo.data, arquivo.filename, dados.numeroNota, arquivo.type);

    // 4) Criar participação
    const part = await query(`
      INSERT INTO participacoes (usuario_id, numero_nota, valor_compra, arquivo_nota)
      OUTPUT INSERTED.*
      VALUES ($1,$2,$3,$4)
    `, [usuario_id, dados.numeroNota, Number(dados.valorCompra), urlArquivo]);
    const participacao_id = part[0].id;

    // 5) Gerar códigos
    const qtd = calcularQuantidadeCodigos(Number(dados.valorCompra));
    const codigos = [];
    for (let i = 0; i < qtd; i++) {
      const codigo = await gerarCodigoUnico();
      await query(`
        INSERT INTO codigos_sorteio (codigo, participacao_id, usuario_id)
        VALUES ($1,$2,$3)
      `, [codigo, participacao_id, usuario_id]);
      codigos.push(codigo);
    }

    // 6) Tenta enviar email agora; se falhar, vai pra fila
    let email_status = 'falha';
    let email_message = '';
    try {
      const r = await enviarEmailCodigos({ nome: dados.nome, email: dados.email, celular: dados.celular }, codigos);
      if (r.success) {
        email_status = 'enviado';
        email_message = 'Email enviado com sucesso!';
        await adicionarEmailNaFila({ id: usuario_id, nome: dados.nome, email: dados.email, celular: dados.celular }, participacao_id, codigos, 0, 'enviado');
        await query(`
          INSERT INTO logs_email (usuario_id, participacao_id, email, assunto, status, mensagem_erro)
          VALUES ($1,$2,$3,$4,'enviado',NULL)
        `, [usuario_id, participacao_id, dados.email, 'Seus códigos de sorteio foram gerados!']);
      } else {
        throw new Error(r.error || 'Erro ao enviar email');
      }
    } catch (err) {
      await adicionarEmailNaFila({ id: usuario_id, nome: dados.nome, email: dados.email, celular: dados.celular }, participacao_id, codigos, 1, 'pendente');
      email_status = 'na_fila';
      email_message = 'Email adicionado à fila de envio. Você receberá em breve!';
      await query(`
        INSERT INTO logs_email (usuario_id, participacao_id, email, assunto, status, mensagem_erro)
        VALUES ($1,$2,$3,$4,'falha',$5)
      `, [usuario_id, participacao_id, dados.email, 'Seus códigos de sorteio foram gerados!', `Adicionado à fila: ${err.message}`]);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        message: 'Participação registrada com sucesso!',
        data: { participacao_id, codigos, email_status, email_message }
      })
    };

  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: 'Erro ao processar sorteio', message: error.message })
    };
  }
};

function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: event.headers });
    const result = { fields: {}, files: {} };

    bb.on('file', (name, file, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        result.files[name] = { filename, type: mimeType, data: Buffer.concat(chunks) };
      });
    });

    bb.on('field', (name, val) => { result.fields[name] = val; });
    bb.on('finish', () => resolve(result));
    bb.on('error', reject);

    const body = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64') : Buffer.from(event.body || '');
    bb.end(body);
  });
}