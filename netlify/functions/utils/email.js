// utils/email.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Paleta Alphabeto
const COR_LARANJA = '#F18417';
const COR_AMARELO = '#FDD71D';
const COR_TURQUESA = '#53C6D9';
const COR_CORAL   = '#EE734F';
const CINZA_TEXTO = '#444444';
const CINZA_MUTED = '#6B7280';
const BG_NEUTRO   = '#FFF8EC';
const BORDA_SUAVE = '#FFE2BE';

function gerarHTMLEmail(usuario, codigos = []) {
  // Monta a grade de códigos (2 colunas no desktop, 1 no mobile)
  const codeCells = codigos.map((c) => `
    <!-- item código -->
    <td align="center" valign="top" style="padding:6px 6px 12px 6px;width:50%;">
      <div style="
        background: linear-gradient(135deg, ${COR_LARANJA} 0%, ${COR_AMARELO} 100%);
        border-radius: 12px; padding: 14px 16px; color: #ffffff;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 18px; font-weight: 800; letter-spacing: 2px; text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,.12);
      ">${c}</div>
    </td>
  `);

  // Quebra em linhas de 2 colunas
  const rows = [];
  for (let i = 0; i < codeCells.length; i += 2) {
    rows.push(`
      <tr>
        ${codeCells[i]}
        ${codeCells[i + 1] || '<td style="width:50%;padding:6px 6px 12px 6px;"></td>'}
      </tr>
    `);
  }

  return `<!DOCTYPE html>
<html lang="pt-br" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width" />
  <title>Alphabeto | Confirmação do sorteio</title>
  <style>
    /* Preheader escondido */
    .preheader { display:none!important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all; }
    /* Mobile: força 1 coluna em telas estreitas */
    @media only screen and (max-width: 620px) {
      .wrap { width:100%!important }
      .stack, .stack td { display:block!important; width:100%!important }
      .codes td { width:100%!important; display:block!important }
      .btn { display:block!important; width:100%!important }
      .pad { padding-left:16px!important; padding-right:16px!important }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#FFFFFF; color:${CINZA_TEXTO};">
  <span class="preheader">Sua participação no sorteio da Alphabeto foi confirmada. Guarde seus códigos! 🍀</span>
  <center style="width:100%;table-layout:fixed;">
    <div class="wrap" style="width:600px; margin:0 auto; background:#FFFFFF;">

      <!-- ===== HEADER (seu banner) ===== -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ed;">
        <tr>
          <td>
            <img src="https://storage.googleapis.com/crmalpha/images/NOVO%20HTML%202025/Design%20sem%20nome.jpg"
                 alt="Alphabeto" style="display:block; width:100%; height:auto; border:0;" />
          </td>
        </tr>
      </table>

      <!-- ===== TÍTULO + SAUDAÇÃO ===== -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td class="pad" style="padding:24px 24px 8px 24px;">
            <h1 style="margin:0 0 6px; font-size:24px; color:${COR_LARANJA}; font-family:Helvetica, Arial, sans-serif;">
              🎉 Participação confirmada!
            </h1>
            <p style="margin:6px 0 0; font-size:15px; color:${CINZA_TEXTO}; line-height:1.5; font-family:Helvetica, Arial, sans-serif;">
              Olá, <strong>${usuario.nome}</strong>! Recebemos sua participação no sorteio da Alphabeto.
            </p>
          </td>
        </tr>
      </table>

      <!-- ===== CARTÃO DE DADOS ===== -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td class="pad" style="padding:10px 24px 0 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG_NEUTRO}; border:1px solid ${BORDA_SUAVE}; border-radius:14px;">
              <tr>
                <td style="padding:16px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:0 0 8px 0;">
                        <h3 style="margin:0; font-size:16px; color:${COR_CORAL}; font-family:Helvetica, Arial, sans-serif;">
                          📋 Seus dados
                        </h3>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:${CINZA_TEXTO}; font-family:Helvetica, Arial, sans-serif;">
                          <tr>
                            <td style="padding:6px 0; width:130px; color:${CINZA_MUTED};"><strong>E-mail:</strong></td>
                            <td style="padding:6px 0;">${usuario.email}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; color:${CINZA_MUTED};"><strong>Celular:</strong></td>
                            <td style="padding:6px 0;">${usuario.celular || '-'}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; color:${CINZA_MUTED};"><strong>Códigos gerados:</strong></td>
                            <td style="padding:6px 0;">${codigos.length}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>            
          </td>
        </tr>
      </table>

      <!-- ===== CÓDIGOS ===== -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td class="pad" style="padding:18px 24px 4px 24px;">
            <h3 style="margin:0 0 10px; font-size:18px; color:${COR_TURQUESA}; font-family:Helvetica, Arial, sans-serif;">
              🎟️ Seus códigos da sorte
            </h3>
          </td>
        </tr>
        <tr>
          <td class="pad" style="padding:0 24px 4px 24px;">
            <table class="codes" role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${rows.join('') || `
                <tr><td style="padding:8px 0; color:${CINZA_MUTED}; font-size:14px; font-family:Helvetica, Arial, sans-serif;">
                  Nenhum código gerado.
                </td></tr>
              `}
            </table>
            <p style="margin:10px 0 0; color:${CINZA_MUTED}; font-size:12px; font-family:Helvetica, Arial, sans-serif;">
              Guarde este e-mail. Cada código equivale a uma chance no sorteio. 🍀
            </p>
          </td>
        </tr>
      </table>

      <!-- ===== DICAS / INFO ===== -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td class="pad" style="padding:12px 24px 24px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="
              background:#FFFFFF; border:1px dashed ${BORDA_SUAVE}; border-radius:12px;">
              <tr>
                <td style="padding:14px;">
                  <p style="margin:0; font-size:13px; line-height:1.6; color:${CINZA_MUTED}; font-family:Helvetica, Arial, sans-serif;">
                    • Guarde seus códigos até o resultado do sorteio.<br/>
                    • Se não recebeu este e-mail corretamente, verifique a caixa de spam.<br/>
                    • Em caso de dúvidas, nossa equipe está à disposição.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- ===== FOOTER (compacto da sua peça) ===== -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px dashed #B3B5C2; background:#FFFFFF;">
        <tr>
          <td style="padding:16px 5%; text-align:center; color:#696969; font-size:11px; font-family:Helvetica, Arial, sans-serif;">
            <img src="https://storage.googleapis.com/crmalpha/images/NOVO%20HTML%202025/Design%20sem%20nome%20(40).png"
                 alt="Alphabeto" style="height:36px; margin-bottom:6px; border:0;" />
            <div style="margin-top:4px; color:#9ca3af;">© Alphabeto — Todos os direitos reservados.</div>
            <div style="margin-top:6px;">
              <span style="color:#9ca3af;">Dúvidas?</span>
              <a class="btn" href="https://www.alphabeto.com/central-atendimento" target="_blank"
                 style="color:${COR_TURQUESA}; text-decoration:none; font-weight:700;">Fale com as fadinhas</a>
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