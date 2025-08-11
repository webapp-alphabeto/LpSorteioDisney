// utils/email-queue.js
const { query } = require('./db-mssql');
const { Resend } = require('resend');
const { gerarHTMLEmail } = require('./email');

const resend = new Resend(process.env.RESEND_API_KEY);

async function adicionarEmailNaFila(usuario, participacao_id, codigos, prioridade = 0, status = 'pendente') {
  const rows = await query(`
    INSERT INTO fila_emails (usuario_id, participacao_id, email, nome, celular, codigos, status, prioridade, tentativas, agendado_para)
    OUTPUT INSERTED.*
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0,SYSDATETIME())
  `, [usuario.id, participacao_id, usuario.email, usuario.nome, usuario.celular, JSON.stringify(codigos), status, prioridade]);
  return rows[0];
}

async function enviarEmailIndividual(item) {
  try {
    const html = gerarHTMLEmail(
      { nome: item.nome, email: item.email, celular: item.celular },
      Array.isArray(item.codigos) ? item.codigos : JSON.parse(item.codigos || '[]')
    );
    const data = await resend.emails.send({
      from: 'Equipe Alphabeto <sorteio@sorteio.alphabeto.com>',
      to: [item.email],
      subject: '🌺 Lilo & Stitch - Seus códigos do sorteio! 🌺',
      html
    });
    return { success: true, id: data.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { adicionarEmailNaFila, enviarEmailIndividual };