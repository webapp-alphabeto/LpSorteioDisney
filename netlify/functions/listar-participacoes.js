// listar-participacoes.js
const { query } = require('./utils/db-mssql');

exports.handler = async () => {
  try {
    const participacoes = await query(`
      SELECT p.*,
             u.nome, u.cpf, u.email, u.celular
      FROM participacoes p
      JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.created_at DESC
    `);

    // Carregar códigos por participação (opcional, em lote)
    const ids = participacoes.map(p => p.id);
    let codigosByPart = {};
    if (ids.length) {
      const allCodes = await query(`
        SELECT participacao_id, codigo
        FROM codigos_sorteio
        WHERE participacao_id IN (${ids.map((_,i)=>`$${i+1}`).join(',')})
        ORDER BY created_at ASC
      `, ids);
      codigosByPart = allCodes.reduce((acc, r) => {
        (acc[r.participacao_id] ||= []).push(r.codigo);
        return acc;
      }, {});
    }

    const payload = participacoes.map(p => ({
      ...p,
      usuario: { nome: p.nome, cpf: p.cpf, email: p.email, celular: p.celular },
      codigos: codigosByPart[p.id] || []
    }));

    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ participacoes: payload }) };
  } catch (error) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: error.message }) };
  }
};