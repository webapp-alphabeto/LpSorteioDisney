// utils/app-utils.js
const { query } = require('./db-mssql');

async function gerarCodigoUnico() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  while (true) {
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random()*chars.length)]).join('');
    const rows = await query('SELECT TOP(1) 1 FROM codigos_sorteio WHERE codigo = $1', [code]);
    if (rows.length === 0) return code;
  }
}

function calcularQuantidadeCodigos(valor) {
  return Math.max(1, Math.floor(Number(valor) / 290));
}

module.exports = { gerarCodigoUnico, calcularQuantidadeCodigos };