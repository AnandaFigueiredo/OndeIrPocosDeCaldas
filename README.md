# Onde Ir Poços de Caldas

## Vitrine e painel administrativo

A nova área de estabelecimentos e o painel de demonstração estão documentados em [docs/establishments.md](docs/establishments.md), incluindo rotas, acesso, testes, armazenamento local e futura integração com Supabase.

Site institucional em React, Vite, Tailwind CSS e JavaScript. Sem backend e sem dependência da API do Instagram. Fontes locais, ícones Lucide e animações com Intersection Observer.

## Executar

```sh
npm install
npm run dev
npm run build
npm run preview
```

No PowerShell com restrição de scripts, use `npm.cmd` no lugar de `npm`.

## Conteúdo para publicação

O projeto começou sem imagens ou logo. O perfil do Instagram não ficou acessível para leitura. Por isso, a paleta verde, creme e areia é provisória, o nome está em texto e os espaços de fotografia estão explicitamente sinalizados. Não foram utilizadas fotos de outras cidades nem inventados clientes, números, preços ou depoimentos.

- `src/config/brand.js`: logo, fotografias do hero, sobre e contato, criadora, história e métricas. Alterar `pending` para `false` apenas após inserir valores reais.
- `src/config/contact.js`: WhatsApp com DDI e DDD, Instagram e e-mail. Sem telefone, os botões de orçamento e contato usam o Instagram. Com telefone preenchido, passam automaticamente a abrir o WhatsApp com a mensagem codificada.
- `src/data/projects.js`: trabalhos reais, links das publicações e imagens das seis categorias. Os espaços de demonstração desaparecem ao preencher o portfólio.
- `src/data/testimonials.js`: depoimentos autorizados. O estado vazio informa que estarão disponíveis em breve.
- `src/data/services.js`: formatos de divulgação.
- `public/images/`: colocar os arquivos autorizados, preferencialmente WebP; usar caminhos como `/images/cafe.webp` nos dados.
- `src/index.css`: variáveis da paleta e estilos responsivos.

## Publicação

Executar o build e publicar a pasta `dist` em uma hospedagem estática. Antes de lançar: validar a identidade com a marca, fornecer as imagens, preencher os dados reais e testar os contatos. Em `index.html`, substituir `og:image` por uma URL absoluta de imagem JPG/PNG oficial e adicionar `og:url` e canonical com o domínio definitivo. `public/social.svg` é uma referência provisória de composição; algumas redes não aceitam SVG como imagem de compartilhamento.

## Verificação de interface

`node scripts/check.mjs` verifica overflow nas larguras 375, 390, 430, 768, 1024, 1440 e 1920, menu mobile, âncoras e contato. Requer servidor em `http://localhost:5174` (ou variável `BASE_URL`) e Microsoft Edge instalado; pode-se definir `BROWSER_PATH` para outro Chromium. Capturas ficam em `test-results/`.
