// utils/email.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

function gerarHTMLEmail(usuario, codigos) {
  return `<!DOCTYPE html>
<html lang="pt-br"><head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width" />
<title>Sorteio Lilo & Stitch | Alphabeto</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap');
.code-box{background:linear-gradient(135deg,#3B82C4 0%,#60A5FA 100%);border-radius:12px;padding:20px;margin:15px 0;color:#fff;font-size:24px;font-weight:700;letter-spacing:3px;text-align:center;box-shadow:0 4px 12px rgba(59,130,196,.3)}
</style>
</head>
<body style="font-family:Quicksand,Helvetica,Arial,sans-serif;background:#F3F4F6;margin:0;padding:0;color:#374151">
  <center style="width:100%;table-layout:fixed">
    <div style="width:600px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#DBEAFE 0%,#EFF6FF 100%)">
        <tr><td align="center" style="padding:40px 20px">
          <img src="https://storage.googleapis.com/crmalpha/images/NOVO%20HTML%202025/Design%20sem%20nome%20(40).png" alt="Alphabeto" style="height:50px;margin-bottom:20px">
          <h1 style="color:#3B82C4;font-size:32px;margin:20px 0;font-weight:700">🌺 Ohana! Você está participando! 🌺</h1>
        </td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:40px 30px">
        <p style="font-size:20px;color:#1F2937;text-align:center;margin:0 0 20px">Aloha, <strong>${usuario.nome}</strong>! 🏝️</p>
        <p style="font-size:16px;line-height:1.6;color:#4B5563;margin:20px 0">
          Sua participação no sorteio <strong>Lilo & Stitch da Alphabeto</strong> foi registrada com sucesso! Você está concorrendo a produtos exclusivos da coleção Disney. 🎁
        </p>
        <div style="margin:30px 0;background:#F9FAFB;border-radius:12px;padding:20px">
          <h3 style="color:#3B82C4;margin:0 0 15px">📋 Dados da sua participação:</h3>
          <table width="100%" cellpadding="5">
            <tr><td style="color:#6B7280"><strong>Email:</strong></td><td style="color:#374151">${usuario.email}</td></tr>
            <tr><td style="color:#6B7280"><strong>Celular:</strong></td><td style="color:#374151">${usuario.celular || '-'}</td></tr>
            <tr><td style="color:#6B7280"><strong>Códigos gerados:</strong></td><td style="color:#374151">${codigos.length} código(s)</td></tr>
          </table>
        </div>
        <div style="margin:40px 0">
          <h2 style="color:#1F2937;text-align:center;margin:0 0 20px">🎟️ Seus códigos da sorte:</h2>
          ${codigos.map(c=>`<div class="code-box">${c}</div>`).join('')}
          <p style="text-align:center;color:#6B7280;font-size:14px;margin-top:20px">Cada código = uma chance de ganhar! 🍀</p>
        </div>
        <p style="text-align:center;color:#6B7280;font-size:16px;margin:30px 0">Boa sorte! Que a magia do Havaí esteja com você! 🌴✨</p>
      </td></tr></table>
      <table width="100%" cellpadding="0" cellspacing="0" style="height:80px;background:#EFF6FF"><tr><td align="center" style="color:#3B82C4;font-size:20px;font-weight:700">🌺 🏄‍♂️ 🌊 Aloha! 🌊 🏄‍♀️ 🌺</td></tr></table>
    </div>
  </center>
</body></html>`;
}

async function enviarEmailCodigos(usuario, codigos) {
  const html = gerarHTMLEmail(usuario, codigos);
  try {
    const data = await resend.emails.send({
      from: 'Equipe Alphabeto <sorteio@sorteio.alphabeto.com>',
      to: [usuario.email],
      subject: '🌺 Lilo & Stitch - Seus códigos do sorteio! 🌺',
      html
    });
    return { success: true, id: data.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { enviarEmailCodigos, gerarHTMLEmail };