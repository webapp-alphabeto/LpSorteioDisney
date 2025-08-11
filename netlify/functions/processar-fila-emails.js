// processar-fila-emails.js
const { query } = require('./utils/db-mssql');
const { enviarEmailIndividual } = require('./utils/email-queue');

exports.handler = async (event) => {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const LIMITE = 50, MAX_TENT = 5;

    const pend = await query(`
      SELECT TOP(${LIMITE}) *
      FROM fila_emails
      WHERE status IN ('pendente','erro')
        AND tentativas < ${MAX_TENT}
        AND agendado_para <= SYSDATETIME()
      ORDER BY prioridade DESC, created_at ASC
    `);

    let enviados = 0, erros = 0;

    for (const item of pend) {
      try {
        await query(`UPDATE fila_emails SET status='enviando' WHERE id=$1`, [item.id]);

        const r = await enviarEmailIndividual(item);

        if (r.success) {
          await query(`
            UPDATE fila_emails
            SET status='enviado', processed_at=SYSDATETIME(), erro_mensagem=NULL
            WHERE id=$1
          `, [item.id]);

          await query(`
            INSERT INTO logs_email (usuario_id, participacao_id, email, assunto, status)
            VALUES ($1,$2,$3,$4,'enviado')
          `, [item.usuario_id, item.participacao_id, item.email, '🎉 Seus códigos de sorteio foram gerados!']);

          enviados++;
        } else {
          throw new Error(r.error);
        }
      } catch (err) {
        const novas = (item.tentativas || 0) + 1;
        await query(`
          UPDATE fila_emails
          SET status = ${novas >= MAX_TENT ? `'erro'` : `'pendente'`},
              tentativas = $1,
              erro_mensagem = $2,
              agendado_para = ${novas < MAX_TENT ? 'DATEADD(hour,1,SYSDATETIME())' : 'agendado_para'}
          WHERE id = $3
        `, [novas, err.message, item.id]);
        erros++;
      }

      await new Promise(r => setTimeout(r, 100));
    }

    const stats = await query(`
      SELECT status, COUNT(*) qt FROM fila_emails
      WHERE status IN ('pendente','erro')
      GROUP BY status
    `);

    const pendentes = stats.find(s => s.status === 'pendente')?.qt || 0;
    const com_erro  = stats.find(s => s.status === 'erro')?.qt || 0;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ processados: pend.length, enviados, erros, fila_restante: { pendentes, com_erro } })
    };
  } catch (error) {
    console.error('Erro geral:', error);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: error.message }) };
  }
};