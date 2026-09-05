# Vitrine de lugares e painel

## Acessos

- `/lugares`: busca por nome e filtro de categoria.
- `/lugares/:slug`: detalhes de um cadastro com campanha pública.
- `/admin/login`: login de demonstração, **admin@example.com / demo123**.
- `/admin`: indicadores e campanhas que vencem em até 30 dias.
- `/admin/establishments`: listagem, edição, ativação e exclusão.
- `/admin/establishments/new`: novo cadastro.
- `/admin/establishments/:id/edit`: edição completa e prévia do card.

A home ganhou uma seção de até seis cadastros entre Descobertas e Divulgação. Header, hero, paleta e demais seções foram preservados. Os links públicos são nativos, com rotas resolvidas pelo frontend; Vercel e Netlify possuem configurações de fallback para acesso direto às URLs.

## Testar sem editar código

1. Entre em `/admin` com o acesso de demonstração.
2. Clique em Novo estabelecimento, informe nome e categoria. O slug é gerado e pode ser editado.
3. Preencha contatos separados, endereço e links completos. Campos vazios não geram botões de contato.
4. Selecione logo, capa e até oito imagens de galeria (JPG, PNG, WebP ou GIF, até 700 KB cada). Os previews podem ser removidos.
5. Defina selo opcional, destaque, ordem, status e datas. Cadastros fictícios podem ser marcados explicitamente.
6. Visualize o card e salve. Abra a vitrine para conferir a publicação.
7. Recarregue o painel para conferir a persistência. Edite, desative e exclua pela listagem.

O período é inclusivo, considerando o dia civil em America/Sao_Paulo. A campanha termina após o último dia, não no começo dele. Registros inativos têm prioridade de status; depois expirados, agendados e ativos. A interface atualiza a consulta a cada 30 segundos e ao receber mudanças locais. Registros expirados continuam no painel; a página pública também verifica a disponibilidade.

## Armazenamento e mocks

`localStorage['ondeir.establishments.v1']` guarda os cadastros e imagens; `sessionStorage['ondeir.mock-session']` guarda a sessão fictícia. Ambos pertencem ao navegador e à origem (domínio/porta). Outro dispositivo ou porta terá dados separados. A autenticação mock não é proteção de segurança.

Na primeira visita são criados seis exemplos em `src/data/establishments.js`, identificados visualmente. Não são anunciantes reais. Números com zeros são inválidos e links example.com são demonstrações. O Maps dos exemplos aponta somente para a cidade, não para uma empresa. Não foram adicionadas fotos externas, preços, avaliações ou clientes reais. A galeria e uploads podem ser testados com arquivos do usuário.

Os previews usam `URL.createObjectURL()` e revogam URLs ao finalizar a leitura. Para sobreviver à navegação e ao recarregamento, o adaptador mock persiste imagens como data URLs. O limite total de localStorage varia por navegador; falhas de espaço são exibidas e não substituem os dados anteriores. Esta estratégia é temporária até o Storage. `resetMockData()` está exportada no serviço e disponível por botão no dashboard apenas em desenvolvimento; exige confirmação e substitui todos os registros locais.

## Arquivos criados

- `src/Routes.jsx`: rotas e carregamento separado das páginas administrativas.
- `src/establishments.css`, `src/admin.css`: estilos da feature, sem alterar a folha global.
- `src/data/establishments.js`: modelo padrão e seis registros demonstrativos.
- `src/services/establishmentsService.js`, `authService.js`: persistência CRUD e autenticação mock.
- `src/utils/establishments.js`, `phone.js`, `dates.js`: publicação, filtros, slugs, links, telefone e datas.
- `src/hooks/useEstablishments.js`, `usePageMeta.js`: consultas e metadados.
- `src/components/establishments/`: cards, seção da home, filtros, galeria e contatos/localização.
- `src/components/admin/`: layout, proteção mock, status, upload e modal acessível nativo.
- `src/pages/PlacesPage.jsx`, `PlaceDetailsPage.jsx`: páginas públicas.
- `src/pages/Admin/`: login, dashboard, listagem e formulário reutilizado por criação/edição.
- `src/lib/supabase.js`, `.env.example`: pontos de integração futura, sem cliente ativo ou credenciais.
- `vercel.json`, `public/_redirects`: fallback de rotas de SPA.
- `scripts/check-establishments.mjs`: verificações funcionais e responsivas em contexto de navegador isolado.
- `docs/establishments.md`: esta documentação.

Alterados: `src/App.jsx` (seção da home), `src/main.jsx` (rotas e estilos), `src/components/UI.jsx` (destino opcional do link da logo, mantendo o padrão na home), `.gitignore` (permitir `.env.example`).

## Contrato para o Supabase

O modelo inclui `id`, `name`, `slug`, `category`, `subcategory`, `shortDescription`, `description`, `logo`, `coverImage`, `gallery`, `phone`, `whatsapp`, `address`, `number`, `neighborhood`, `city`, `state`, `zipCode`, `mapsUrl`, `instagram`, `website`, `openingHours`, `priceRange`, `badge`, `placementType`, `displayOrder`, `isActive`, `startDate`, `endDate`, `createdAt`, `updatedAt` e `isMock` (somente demonstração). Galeria: array de URLs; horários: array `{ day, hours }`; datas de campanha: `YYYY-MM-DD` ou null; timestamps: ISO. Destaque: standard/featured/premium.

Substituir os métodos assíncronos `getAll`, `getPublic`, `getById`, `getBySlug`, `create`, `update`, `remove`, `toggleStatus` no serviço pela tabela **establishments**, mapeando camelCase para colunas se necessário. Manter a ordenação por displayOrder e a verificação de campanha na consulta pública. Definir slug único, validação de datas e tipos no banco. `getById` deve ficar restrito ao admin autenticado; `getBySlug` público deve retornar somente campanhas válidas.

Substituir authService por Supabase Auth e sessão real; ativar políticas RLS para leitura pública válida e escrita apenas por administradores autorizados. Substituir uploads locais por Supabase Storage com controle de tipo/tamanho e permissões. Nunca expor service_role no frontend. Configurar apenas variáveis VITE públicas no cliente; não há Supabase SDK instalado nem chamadas remotas nesta versão.

### Keep-alive futuro (não ativo)

Após integrar o banco, criar `/api/keep-alive` no servidor, consultando somente `id` com limite 1 na tabela establishments, e adicionar em `vercel.json` a propriedade `crons: [{ "path": "/api/keep-alive", "schedule": "0 12 * * *" }]`. Não foi criado Cron que chame endpoint inexistente. Usar variáveis do servidor e autenticar o endpoint de Cron conforme a implantação. As variáveis estão listadas vazias em `.env.example`.

## Verificar

Com o Vite em execução: `node scripts/check-establishments.mjs`. Padrão: `http://localhost:5174`; altere `BASE_URL` se necessário. Usa Edge headless ou `BROWSER_PATH`. Verifica filtros, contatos, campanhas, login, CRUD, persistência de imagens, modal, drawer e larguras 375/390/430/768/1440. Executa em contexto isolado, sem alterar os dados do navegador da cliente.

`npm run build` gera os arquivos para publicação estática. Metadados das páginas são atualizados no cliente; indexação com HTML previamente renderizado exigirá prerender/SSR quando houver dados reais e domínio definitivo.
