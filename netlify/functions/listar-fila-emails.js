// netlify/functions/listar-fila-emails.js
const { query } = require('./utils/db-mssql');

exports.handler = async (event) => {
  try {
    const url = new URL(event.rawUrl || `http://x${event.path}${event.queryStringParameters ? '?' + new URLSearchParams(event.queryStringParameters) : ''}`);
    const status = url.searchParams.get('status');

    let sql = `
      SELECT TOP(500)
        id, usuario_id, participacao_id, email, nome, celular,
        codigos, status, tentativas, prioridade,
        agendado_para, processed_at, erro_mensagem, created_at
      FROM fila_emails
    `;
    const params = [];
    if (status) {
      sql += ` WHERE status = $1 ORDER BY created_at DESC`;
      params.push(status);
    } else {
      sql += ` ORDER BY created_at DESC`;
    }

    const items = await query(sql, params);

    return {
      statusCode: 200,
      headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' },
      body: JSON.stringify({ items })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: true, message: err.message }) };
  }
};