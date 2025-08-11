#!/bin/bash

# Criar public/index.html
mkdir -p public
curl -o public/index.html https://gist.githubusercontent.com/anonymous/raw/formulario-sorteio.html

# Criar netlify/functions/processar-sorteio.js
curl -o netlify/functions/processar-sorteio.js https://gist.githubusercontent.com/anonymous/raw/processar-sorteio.js

# Criar netlify/functions/utils/supabase.js
curl -o netlify/functions/utils/supabase.js https://gist.githubusercontent.com/anonymous/raw/supabase.js

# Criar netlify/functions/utils/email.js
curl -o netlify/functions/utils/email.js https://gist.githubusercontent.com/anonymous/raw/email.js

echo "✅ Arquivos criados com sucesso!"
