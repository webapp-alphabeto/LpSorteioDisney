// const { createClient } = require('@supabase/supabase-js');

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// if (!supabaseUrl || !supabaseServiceKey) {
//   throw new Error('Missing Supabase environment variables');
// }

// const supabase = createClient(supabaseUrl, supabaseServiceKey);

// // Função para gerar código único
// async function gerarCodigoUnico() {
//   const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//   let codigo;
//   let existe = true;
  
//   while (existe) {
//     codigo = '';
//     for (let i = 0; i < 8; i++) {
//       codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
//     }
    
//     // Verificar se código já existe
//     const { data } = await supabase
//       .from('codigos_sorteio')
//       .select('codigo')
//       .eq('codigo', codigo)
//       .single();
    
//     existe = !!data;
//   }
  
//   return codigo;
// }

// // Função para calcular quantidade de códigos
// function calcularQuantidadeCodigos(valor) {
//   return Math.max(1, Math.floor(valor / 290));
// }

// // Função para fazer upload da nota fiscal com nome customizado
// async function uploadNotaFiscal(file, originalFileName, numeroNota) {
//   // Limpar número da nota para usar no nome do arquivo
//   const numeroNotaLimpo = numeroNota.replace(/[^a-zA-Z0-9]/g, '_');
  
//   // Pegar extensão do arquivo original
//   const extensao = originalFileName.split('.').pop().toLowerCase();
  
//   // Criar novo nome: numeroNota_timestamp.extensao
//   const novoNomeArquivo = `${numeroNotaLimpo}_${Date.now()}.${extensao}`;
  
//   console.log(`Upload arquivo: ${originalFileName} como ${novoNomeArquivo}`);
  
//   const { data, error } = await supabase.storage
//     .from('notas-fiscais')
//     .upload(novoNomeArquivo, file, {
//       contentType: file.type,
//       upsert: false
//     });
  
//   if (error) throw error;
  
//   // Retornar URL pública
//   const { data: { publicUrl } } = supabase.storage
//     .from('notas-fiscais')
//     .getPublicUrl(data.path);
  
//   return publicUrl;
// }

// module.exports = {
//   supabase,
//   gerarCodigoUnico,
//   calcularQuantidadeCodigos,
//   uploadNotaFiscal
// };