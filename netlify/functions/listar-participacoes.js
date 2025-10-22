// netlify/functions/listar-participacoes.js
const { query } = require('./utils/db-mssql');

/**
 * Faz o SELECT agregando códigos em 1 única ida ao banco.
 * Tenta com STRING_AGG (SQL Server 2017+). Em caso de erro de função
 * não reconhecida (ex.: number 195), cai para a versão legacy.
 */
async function fetchParticipacoesComCodigos() {
  const sqlModern = `
    SELECT
      p.*,
      u.nome, u.cpf, u.email, u.celular,
      -- status default "pendente" se vier NULL
      ISNULL(p.status, 'pendente') AS status,
      -- agrega códigos ordenados por created_at
      STRING_AGG(cs.codigo, ',') WITHIN GROUP (ORDER BY cs.created_at) AS codigos_str
    FROM participacoes p
    JOIN usuarios u ON u.id = p.usuario_id
    LEFT JOIN codigos_sorteio cs ON cs.participacao_id = p.id
    GROUP BY
      p.id, p.usuario_id, p.numero_nota, p.valor_compra, p.arquivo_nota, p.created_at, p.status,
      u.nome, u.cpf, u.email, u.celular
    ORDER BY p.created_at DESC
  `;

  try {
    return await query(sqlModern);
  } catch (e) {
    // 195 = 'não reconhecido' (ex.: STRING_AGG inexistente em versões antigas)
    const isMissingFunc =
      e?.number === 195 ||
      /STRING_AGG/i.test(e?.message || '') ||
      /is not a recognized built-in function/i.test(e?.message || '');

    if (!isMissingFunc) throw e;

    // Fallback para SQL Server antigos (2012/2014/2016)
    const sqlLegacy = `
      SELECT
        p.*,
        u.nome, u.cpf, u.email, u.celular,
        ISNULL(p.status, 'pendente') AS status,
        -- Agrega códigos usando FOR XML PATH (legacy)
        STUFF((
          SELECT ',' + cs2.codigo
          FROM codigos_sorteio cs2
          WHERE cs2.participacao_id = p.id
          ORDER BY cs2.created_at
          FOR XML PATH(''), TYPE
        ).value('.', 'NVARCHAR(MAX)'), 1, 1, '') AS codigos_str
      FROM participacoes p
      JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.created_at DESC
    `;

    return await query(sqlLegacy);
  }
}

exports.handler = async () => {
  const t0 = Date.now();
  try {
    const rows = await fetchParticipacoesComCodigos();

    const payload = rows.map(r => ({
      // campos da participação
      id: r.id,
      usuario_id: r.usuario_id,
      numero_nota: r.numero_nota,
      valor_compra: r.valor_compra,
      arquivo_nota: r.arquivo_nota,
      created_at: r.created_at,
      status: r.status ?? 'pendente',
      // dados do usuário
      usuario: {
        nome: r.nome,
        cpf: r.cpf,
        email: r.email,
        celular: r.celular,
      },
      // lista de códigos agregados
      codigos: r.codigos_str ? String(r.codigos_str).split(',') : [],
    }));

    const elapsed = Date.now() - t0;
    console.log(`listar-participacoes OK: ${payload.length} registros em ${elapsed}ms`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        // CORS extra (se precisar em fetch com preflight)
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({ participacoes: payload }),
    };
  } catch (error) {
    console.error(
      'listar-participacoes ERROR:',
      error?.number,
      error?.code,
      error?.message,
      error?.stack
    );
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({ error: error?.message || 'Internal error' }),
    };
  }
};
