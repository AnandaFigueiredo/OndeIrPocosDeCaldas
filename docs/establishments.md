# Vitrine e painel conectados ao Supabase

## Configuração

O fluxo normal usa o Supabase existente. Não execute os SQLs antigos em `supabase/`: eles pertencem à proposta anterior de schema e não são necessários para esta integração. Nenhuma tabela, policy, função ou bucket foi criada ou alterada por esta entrega.

O arquivo `.env.local`, na raiz, já recebeu os valores fornecidos. Ele é ignorado pelo Git. A configuração de referência em `.env.example` não contém chaves reais:

```env
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

Use a URL base, sem `/rest/v1/`. Reinicie o Vite após editar variáveis. Na hospedagem, configure essas mesmas variáveis antes de compilar. Nunca use service role ou chave secreta no frontend.

A dependência existente `@supabase/supabase-js@2.117.0` foi reutilizada. A publishable key identifica o projeto; o acesso aos dados é controlado por Auth e RLS. Referência: [chaves de API do Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

## Como testar

1. Execute `npm.cmd run dev` e abra a URL exibida pelo terminal.
2. Acesse `/admin/login`. Use o e-mail e a senha do administrador que você já criou no Supabase Auth. O aplicativo verifica `is_admin()` e recusa contas não autorizadas. O acesso de demonstração não está ativo.
3. Acesse **Estabelecimentos → Novo estabelecimento**. Preencha nome, categoria, dados, status, ordem e datas de campanha.
4. Selecione logo, capa e galeria: JPG, PNG ou WebP, até 5 MB por arquivo e oito imagens na galeria. O limite efetivo também depende do bucket. A prévia aparece antes do envio; o upload ocorre ao salvar.
5. Clique em **Cadastrar estabelecimento**. O aplicativo cria o registro inativo, obtém seu ID, envia imagens, atualiza as URLs e o status escolhido e volta à listagem com a confirmação.
6. Abra a edição e recarregue a página para verificar a persistência. Salvar sem trocar as imagens preserva as URLs e não faz novos uploads.
7. Confira a home em **Por onde começar?**, `/lugares` e `/lugares/slug-do-negocio`. Use também uma janela anônima. A home exibe os primeiros seis registros públicos; busca e categoria funcionam em `/lugares`.
8. Teste ativação/desativação, datas e edição. Cadastros que a policy pública não permite devem desaparecer da vitrine, inclusive quando você está logado como admin.
9. Ao excluir, confirme no modal. O registro é removido e o aplicativo tenta limpar seus arquivos. Falhas de limpeza geram aviso sem desfazer a exclusão.
10. Use **Sair** e confira que `/admin` volta a exigir login.

O painel gerencia os estabelecimentos. Os demais textos, seções, portfólio e identidade visual do site continuam nos arquivos existentes.

## Banco e campos

A tabela usada é `public.establishments`. O mapper centraliza as conversões:

| Frontend | Banco |
| --- | --- |
| shortDescription | short_description |
| logo | logo_url |
| coverImage | cover_image_url |
| number | address_number |
| zipCode | cep |
| mapsUrl | maps_url |
| instagram | instagram_url |
| website | website_url |
| openingHours | opening_hours |
| placementType | placement_type |
| displayOrder | display_order |
| isActive | is_active |
| startDate / endDate | start_date / end_date |

`gallery` é um array de URLs e `opening_hours` um array de objetos `{ day, hours }`. `created_at` e `updated_at` ficam sob controle do banco. As colunas `price_range` e `is_mock` não existem no banco conferido; por isso não são enviadas nem oferecidas no formulário real.

A camada de serviço mantém `getAll`, `getPublic`, `getById`, `getBySlug`, `create`, `update`, `remove` e `toggleStatus(id, isActive)`. A ordenação é por `display_order`, depois `created_at` decrescente e `id` para desempate.

O cliente administrativo persiste a sessão de Auth e usa as permissões da conta. A vitrine utiliza um cliente sem sessão persistida para que a RLS pública se aplique mesmo no navegador do administrador. Não duplicamos filtros de campanha na consulta pública. Os helpers de datas continuam mostrando ATIVO, INATIVO, AGENDADO e EXPIRADO no painel.

## Imagens e recuperação de falhas

Bucket existente: `establishments`. Caminhos: `logos/{id}/...`, `covers/{id}/...` e `gallery/{id}/...`. Os nomes recebem timestamp, UUID e nome sanitizado. O site salva URLs públicas.

Arquivos existentes são preservados durante edição; novas seleções ficam em memória até salvar. Imagens substituídas ou removidas da galeria são limpas após o banco confirmar a alteração.

Se o upload de um cadastro novo falhar, o aplicativo tenta desfazer o registro inativo. Se não conseguir, mostra um link para continuar sua edição e bloqueia nova criação pelo mesmo formulário para evitar duplicação. A limpeza de arquivos é feita por melhor esforço e pode exigir conferência manual se a rede ou as permissões falharem.

## Validação realizada e limites

- Conexão real com a publishable key: consulta `id, name` bem-sucedida, sem registros públicos na amostra.
- Consulta real confirmou os nomes de colunas usados; `price_range` e `is_mock` estão ausentes.
- `is_admin()` retornou `false` sem sessão.
- Navegador com leitura pública real: sem exceções ou erros no console; rota administrativa redirecionou ao login e nenhum dado mock foi carregado.
- Teste com respostas da API simuladas: login válido/inválido, usuário sem autorização, CRUD, mapper, formatos, prévias, uploads, preservação de imagens, consulta pública sem sessão administrativa, rollback de falha de upload, falha de limpeza de Storage e logout.
- `npm.cmd run build`: aprovado.

Os testes simulados não comprovam as policies de escrita do projeto real. Login administrativo, CRUD autenticado e upload real ainda precisam ser conferidos com a conta administradora. Não foram recebidas credenciais dessa conta e não foram criados registros remotos de teste. Uma leitura vazia não constitui uma auditoria completa das policies de RLS.

Comandos:

```sh
node scripts/check-supabase-connection.mjs
node scripts/check-supabase-ui.mjs
npm.cmd run build
```

O teste de navegador inicia seu próprio Vite em `127.0.0.1:5186` e usa Edge headless (ou `BROWSER_PATH`). A primeira etapa faz leitura real. Depois, todas as chamadas ao Supabase são interceptadas; nenhuma gravação alcança o banco remoto.

## Mocks de desenvolvimento

Nenhum mock está ativo na configuração entregue ou em produção. O backup `src/data/establishments.js` só é importado pelo adaptador mock carregado dinamicamente quando `VITE_DATA_MODE=mock` e `import.meta.env.DEV`. O modelo vazio foi separado para não carregar exemplos no fluxo normal.

O script antigo `scripts/check-establishments.mjs` exige um servidor separado em modo mock e falha antes de qualquer gravação se detectar Supabase. Os dados desse modo ficam apenas no navegador de teste.

## Arquivos desta integração

Criados nesta etapa:
- `src/data/emptyEstablishment.js`
- `src/components/admin/ImageUpload.jsx` (substitui `ImageUploadMock.jsx`)
- `src/services/storageService.js`
- `scripts/check-supabase-connection.mjs`
- `scripts/check-supabase-ui.mjs`

Atualizados:
- `.env.local` (somente local), `.env.example` e `.gitignore`
- `src/lib/supabase.js`
- `src/services/authService.js`, `establishmentsMapper.js`, `establishmentsSupabaseService.js`, `establishmentsMockService.js` e `mediaService.js`
- `src/data/establishments.js`
- `src/pages/Admin/LoginPage.jsx`
- `src/pages/Admin/Establishments/EstablishmentForm.jsx` e `EstablishmentsListPage.jsx`
- `src/hooks/useEstablishments.js` e `src/pages/PlaceDetailsPage.jsx`
- `scripts/check-establishments.mjs`, `README.md` e esta documentação.

A camada de seleção de serviço, a rota protegida e o dashboard existentes foram reutilizados. `package.json` e `package-lock.json` já tinham sido atualizados na correção anterior para instalar o SDK. Keep-alive e Cron não foram implementados.
