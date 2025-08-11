// utils/email.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Cores da marca
const COR_LARANJA = '#F18417';
const COR_AMARELO = '#FDD71D';
const COR_TURQUESA = '#53C6D9';
const COR_CORAL = '#EE734F';

function gerarHTMLEmail(usuario, codigos) {
  const codesHTML = (codigos || [])
    .map(
      (c) => `
        <tr>
          <td style="padding:6px 0">
            <div style="
              background: linear-gradient(135deg, ${COR_LARANJA} 0%, ${COR_AMARELO} 100%);
              border-radius: 12px;
              padding: 14px 16px;
              color: #fff;
              font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
              font-size: 18px;
              font-weight: 800;
              letter-spacing: 2px;
              text-align: center;
              box-shadow: 0 4px 12px rgba(0,0,0,.12);
            ">${c}</div>
          </td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-br" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width" />
  <title>Alphabeto | Confirmação do sorteio</title>
  <style>
    /* Mantive apenas estilos mínimos; o resto está inline para compatibilidade */
    a { text-decoration: none; }
  </style>
</head>
<body style="margin:0; padding:0; background:#FFFFFF; color:#374151; font-family: Quicksand, Helvetica, Arial, sans-serif;">
  <center style="width:100%;table-layout:fixed;">
    <div style="width:600px; margin:0 auto; background:#FFFFFF;">

      <!-- ===== HEADER (seu mesmo banner) ===== -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ed;">
        <tr>
          <td>
            <img src="https://storage.googleapis.com/crmalpha/images/NOVO%20HTML%202025/Design%20sem%20nome.jpg"
                 alt="Alphabeto" style="display:block; width:100%; height:auto; border:0;" />
          </td>
        </tr>
      </table>

      <!-- ===== MIolo do sorteio ===== -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;">
        <tr>
          <td style="padding:22px 18px 8px;">
            <h1 style="margin:0 0 6px; font-size:22px; color:${COR_LARANJA};">🎉 Participação confirmada!</h1>
            <p style="margin:6px 0 0; font-size:14px; color:#444;">
              Olá, <strong>${usuario.nome}</strong>! Recebemos sua participação no sorteio da Alphabeto.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:10px 18px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="
              background:#FFF8EC; border:1px solid #FFE2BE; border-radius:14px;">
              <tr>
                <td style="padding:16px;">
                  <h3 style="margin:0 0 8px; font-size:16px; color:${COR_CORAL};">📋 Seus dados</h3>
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px; color:#333;">
                    <tr>
                      <td style="padding:4px 0; width:130px; color:#6B7280;"><strong>E-mail:</strong></td>
                      <td style="padding:4px 0;">${usuario.email}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0; color:#6B7280;"><strong>Celular:</strong></td>
                      <td style="padding:4px 0;">${usuario.celular || '-'}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0; color:#6B7280;"><strong>Códigos gerados:</strong></td>
                      <td style="padding:4px 0;">${codigos.length}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Códigos -->
        <tr>
          <td style="padding:16px 18px 4px;">
            <h3 style="margin:0 0 10px; font-size:18px; color:${COR_TURQUESA};">🎟️ Seus códigos da sorte</h3>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${codesHTML || `
                <tr><td style="padding:8px 0; color:#777; font-size:14px;">Nenhum código gerado.</td></tr>
              `}
            </table>
            <p style="margin:10px 0 0; color:#6B7280; font-size:12px;">
              Guarde este e-mail. Cada código equivale a uma chance no sorteio. 🍀
            </p>
          </td>
        </tr>
      </table>

      <!-- ===== FOOTER (seu mesmo rodapé compacto) ===== -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px dashed #B3B5C2; background:#FFFFFF;">
        <tr>
          <td style="padding:16px 5%; text-align:center; color:#696969; font-size:11px;">
            <img src="https://storage.googleapis.com/crmalpha/images/NOVO%20HTML%202025/Design%20sem%20nome%20(40).png"
                 alt="Alphabeto" style="height:36px; margin-bottom:6px; border:0;" />
            <div style="margin-top:4px; color:#9ca3af;">© Alphabeto – Todos os direitos reservados.</div>
            <div style="margin-top:6px;">
              <span style="color:#9ca3af;">Dúvidas?</span>
              <a href="https://www.alphabeto.com/central-atendimento" style="color:${COR_TURQUESA};">Fale com as fadinhas</a>
            </div>
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
      subject: '🎟️ Alphabeto — seus códigos do sorteio',
      html,
      // (Opcional) melhora entregabilidade:
      text: [
        `Olá, ${usuario.nome}! Sua participação no sorteio da Alphabeto foi confirmada.`,
        `Códigos: ${(codigos || []).join(', ') || '—'}`,
        `E-mail: ${usuario.email}`,
        `Celular: ${usuario.celular || '-'}`,
        `Boa sorte!`
      ].join('\n')
    });
    return { success: true, id: data.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { enviarEmailCodigos, gerarHTMLEmail };