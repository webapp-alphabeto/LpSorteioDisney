// utils/email.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Gera o HTML baseado no seu template, com áreas dinâmicas (nome, email e códigos)
function gerarHTMLEmail(usuario, codigos) {
  const codesHTML = (codigos || [])
    .map(c => `<div class="code-box">${c}</div>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-br" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width" />
  <title>Alphabeto | Confirmação de participação no sorteio</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap');
    body a { text-decoration: none; }
    .code-box{
      background: linear-gradient(135deg,#3B82C4 0%,#60A5FA 100%);
      border-radius: 12px;
      padding: 16px;
      margin: 10px 0;
      color: #fff;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 3px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(59,130,196,.25);
    }
    .box{
      background:#F9FAFB;border-radius:12px;padding:16px;margin:16px 0;border:1px solid #e5e7eb;
      font-family: Quicksand,Helvetica,Arial,sans-serif; color:#374151;
    }
    .box h3{margin:0 0 8px;color:#3B82C4}
    .muted{color:#6B7280}
  </style>
</head>

<body style="font-family: Quicksand,Helvetica,Arial,sans-serif; font-size: 11px; color: #7e7f88; margin: 0; padding: 0; background-color: #FFFFFF;">
  <center style="width:100%;table-layout:fixed;">
    <div id="principal" style="width:600px; margin:0 auto; background-color:#FFFFFF;">

      <!-- HERO -->
      <table cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="background-color:#fdf6ed;">
        <tr align="center" valign="middle" width="100%">
          <td align="center">
            <table id="onda" width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr align="center">
                <td width="100%" align="top" style="display:block;">
                  <img src="https://storage.googleapis.com/crmalpha/images/NOVO%20HTML%202025/Design%20sem%20nome.jpg"
                       alt="Alphabeto" style="display:block; background-color:#fdf6ed;" width="100%" />
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Menu simplificado (opcional) -->
        <tr style="background-color:#FFFFFF;">
          <td align="center" style="background-color:#FFFFFF;">
            <table cellpadding="0" cellspacing="0" border="0" align="center" width="600" style="padding: 18px 0 10px;">
              <tr>
                <td align="middle" style="font-size:14px; font-weight:700; color:#F18417;">SORTEIO LILO & STITCH • ALPHABETO</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Faixa resumo -->
        <tr align="center" valign="middle" width="100%" style="background-color:#FFFFFF;">
          <td align="center" style="padding: 0 16px 8px;">
            <div class="box" style="text-align:left;">
              <h3 style="font-size:18px;">🎉 Participação confirmada!</h3>
              <p style="font-size:14px;color:#374151;margin:6px 0;">
                Olá, <strong>${usuario.nome}</strong>! Recebemos sua participação no sorteio
                <strong>Lilo &amp; Stitch</strong>. Abaixo estão os seus códigos da sorte.
              </p>
              <table width="100%" cellpadding="6" style="font-size:14px;">
                <tr>
                  <td class="muted" width="140"><strong>E-mail:</strong></td>
                  <td style="color:#374151">${usuario.email}</td>
                </tr>
                <tr>
                  <td class="muted"><strong>Celular:</strong></td>
                  <td style="color:#374151">${usuario.celular || '-'}</td>
                </tr>
                <tr>
                  <td class="muted"><strong>Qtde. de códigos:</strong></td>
                  <td style="color:#374151">${codigos.length}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- Códigos -->
        <tr align="center" valign="middle" width="100%" style="background-color:#FFFFFF;">
          <td align="center" style="padding: 0 16px 16px;">
            <div class="box" style="text-align:left;">
              <h3 style="font-size:18px;margin-bottom:10px">🎟️ Seus códigos</h3>
              ${codesHTML || '<p class="muted" style="margin:6px 0;">Nenhum código gerado.</p>'}
              <p class="muted" style="font-size:12px;margin-top:12px;">Cada código equivale a uma chance no sorteio. Boa sorte! 🍀</p>
            </div>
          </td>
        </tr>

        <!-- Banner principal (opcional) -->
        <tr align="center" valign="middle" width="100%" style="background-color:#FFFFFF;">
          <td align="center">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr align="center">
                <td width="100%" align="top" style="display:block; margin-bottom: 2%;">
                  <img src="https://storage.googleapis.com/crmalpha/images/emails%20fixos/basicos/BANNER%20-%20600%20x%20800.jpg"
                       alt="Alphabeto" style="display:block;" width="100%" />
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Régua de benefícios -->
        <tr align="center" valign="middle" width="100%" style="background-color:#FFFFFF;">
          <td align="center">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr align="center">
                <td width="100%" align="top" style="display:block; margin-bottom: 2%;">
                  <img src="https://storage.googleapis.com/crmalpha/images/NOVO%20HTML%202025/FOOTER%20REGUA%20(600%20x%20350%20px)%20(8).jpg"
                       alt="Benefícios" style="display:block;" width="100%" />
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Rodapé compacto -->
        <tr>
          <td style="border-top:1px dashed #B3B5C2;background-color:#FFFFFF;">
            <table width="90%" border="0" align="center" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:16px 0; width:100%; text-align:center; font-size:11px; color:#696969;">
                  <img src="https://storage.googleapis.com/crmalpha/images/NOVO%20HTML%202025/Design%20sem%20nome%20(40).png" alt="Alphabeto" style="height:36px; margin-bottom:8px" />
                  <div style="margin-top:6px;color:#9ca3af">© Alphabeto – Todos os direitos reservados.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </div>
  </center>
</body>
</html>`;
}

async function enviarEmailCodigos(usuario, codigos) {
  const html = gerarHTMLEmail(usuario, codigos);
  try {
    const data = await resend.emails.send({
      from: 'Equipe Alphabeto <sorteio@sorteio.alphabeto.com>',
      to: [usuario.email],
      subject: '🎟️ Seus códigos do sorteio – Alphabeto',
      html
    });
    return { success: true, id: data.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { enviarEmailCodigos, gerarHTMLEmail };