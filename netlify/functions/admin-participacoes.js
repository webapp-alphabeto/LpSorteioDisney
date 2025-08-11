// netlify/functions/admin-participacoes.js
const { query } = require('./utils/db-mssql');

exports.handler = async () => {
  try {
    // pega participações + usuário
    const rows = await query(`
      SELECT
        p.id, p.usuario_id, p.numero_nota, p.valor_compra, p.arquivo_nota, p.created_at,
        ISNULL(p.status, 'pendente') AS status,
        u.nome, u.cpf, u.email, u.celular
      FROM participacoes p
      JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.created_at DESC
    `);

    const ids = rows.map(r => r.id);
    let codigosMap = {};
    if (ids.length) {
      const allCodes = await query(`
        SELECT participacao_id, codigo
        FROM codigos_sorteio
        WHERE participacao_id IN (${ids.map((_,i)=>`$${i+1}`).join(',')})
        ORDER BY created_at ASC
      `, ids);

      codigosMap = allCodes.reduce((acc, cur) => {
        (acc[cur.participacao_id] ||= []).push(cur.codigo);
        return acc;
      }, {});
    }

    const participacoes = rows.map(r => ({
      id: r.id,
      usuario_id: r.usuario_id,
      numero_nota: r.numero_nota,
      valor_compra: r.valor_compra,
      arquivo_nota: r.arquivo_nota,
      created_at: r.created_at,
      status: r.status,
      usuario: {
        nome: r.nome,
        cpf: r.cpf,
        email: r.email,
        celular: r.celular
      },
      codigos: codigosMap[r.id] || []
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participacoes })
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};