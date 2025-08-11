// utils/db-mssql.js
const sql = require('mssql');

let pool;
async function getPool() {
  if (pool) return pool;
  pool = await sql.connect({
    user: process.env.SQLSERVER_USER,
    password: process.env.SQLSERVER_PASSWORD,
    server: process.env.SQLSERVER_HOST,
    database: process.env.SQLSERVER_DATABASE,
    port: Number(process.env.SQLSERVER_PORT || 1433),
    options: {
      encrypt: true,
      trustServerCertificate: true
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
  });
  return pool;
}

async function query(q, params = []) {
  const p = await getPool();
  const request = p.request();
  params.forEach((v, i) => request.input(`p${i}`, v));
  const replaced = q.replace(/\$(\d+)/g, (_, idx) => `@p${Number(idx) - 1}`);
  const result = await request.query(replaced);
  return result.recordset;
}

module.exports = { query, getPool };