// netlify/functions/reenviar-email.js
const { query } = require('./utils/db-mssql');
const { enviarEmailCodigos } = require('./utils/email');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  try {
    const { id } = JSON.parse(event.body || '{}');
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'id é obrigatório' }) };

    // Carrega o item
    const rows = await query(`SELECT TOP(1) * FROM fila_emails WHERE id=$1`, [id]);
    if (!rows.length) return { statusCode: 404, body: JSON.stringify({ error: 'Item não encontrado' }) };
    const item = rows[0];

    // Marca "enviando"
    await query(`UPDATE fila_emails SET status='enviando' WHERE id=$1`, [id]);

    const codigos = typeof item.codigos === 'string' ? JSON.parse(item.codigos) : item.codigos;
    const usuario = { nome: item.nome, email: item.email, celular: item.celular };

    const r = await enviarEmailCodigos(usuario, codigos);

    if (r.success) {
      await query(`
        UPDATE fila_emails
        SET status='enviado', processed_at=SYSDATETIME(), erro_mensagem=NULL, tentativas=ISNULL(tentativas,0)+1
        WHERE id=$1
      `, [id]);

      // log
      await query(`
        INSERT INTO logs_email (usuario_id, participacao_id, email, assunto, status, mensagem_erro)
        VALUES ($1,$2,$3,$4,'enviado',NULL)
      `, [item.usuario_id, item.participacao_id, item.email, 'Reenvio de códigos do sorteio']);

      return {
        statusCode: 200,
        headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' },
        body: JSON.stringify({ success: true, id: r.id })
      };
    }

    // Falha
    await query(`
      UPDATE fila_emails
      SET status='erro', erro_mensagem=$2, tentativas=ISNULL(tentativas,0)+1
      WHERE id=$1
    `, [id, r.error || 'Falha ao enviar']);

    await query(`
      INSERT INTO logs_email (usuario_id, participacao_id, email, assunto, status, mensagem_erro)
      VALUES ($1,$2,$3,$4,'falha',$5)
    `, [item.usuario_id, item.participacao_id, item.email, 'Reenvio de códigos do sorteio', r.error || 'Falha ao enviar']);

    return { statusCode: 500, body: JSON.stringify({ success:false, message: r.error || 'Falha ao enviar' }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success:false, message: err.message }) };
  }
};