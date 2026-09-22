import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { createServer, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// Leitura real sem sessão + contrato simulado no navegador, sem gravar no banco remoto.
const env = loadEnv('development', process.cwd(), 'VITE_');
const remote = env.VITE_SUPABASE_URL;
const server = await createServer({ configFile: false, plugins: [tailwindcss()], esbuild: { jsx: 'automatic' }, server: { host: '127.0.0.1', port: 5186, strictPort: true } });
await server.listen();
let browser;
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
const base = 'http://127.0.0.1:5186';
try {
  browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const exceptions = [], consoleErrors = [];
  page.on('pageerror', error => exceptions.push(error.message));
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  await page.goto(base + '/lugares');
  await expect(page.locator('.result-count')).not.toContainText('Carregando', { timeout: 20000 });
  await expect(page.locator('[role="alert"]')).toHaveCount(0);
  assert.equal(await page.evaluate(() => localStorage.getItem('ondeir.establishments.v1')), null);
  await page.goto(base + '/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByText('Acesso de demonstração', { exact: true })).toHaveCount(0);
  assert.deepEqual(exceptions, []);
  assert.deepEqual(consoleErrors, []);
  console.log('PASS leitura pública real, ambiente sem mocks, rota protegida e console sem erros.');

  // Todas as chamadas remotas daqui em diante são interceptadas, inclusive gravações.
  const rows = new Map(), objects = new Set(), calls = [];
  let admin = true, badLogin = false, failUpload = false, failDeleteStorage = false;
  const user = { id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', email: 'admin@test.local', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
  const jwtPart = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const accessToken = `${jwtPart({ alg: 'HS256', typ: 'JWT' })}.${jwtPart({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })}.test`;
  await context.route(remote + '/**', async route => {
    const req = route.request(), url = new URL(req.url()), method = req.method();
    const path = url.pathname;
    const json = (value, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
    calls.push({ path, method, search: url.search, authorization: req.headers().authorization });
    if (path === '/auth/v1/token') return badLogin ? json({ code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400) : json({ access_token: accessToken, token_type: 'bearer', expires_in: 3600, refresh_token: 'test-refresh-token', user });
    if (path === '/auth/v1/user') return json(user);
    if (path === '/auth/v1/logout') return json({});
    if (path === '/rest/v1/rpc/is_admin') return json(admin);
    if (path.startsWith('/storage/v1/object/public/')) return route.fulfill({ contentType: 'image/png', body: png });
    if (path === '/storage/v1/object/list/establishments') {
      const { prefix, offset = 0, limit = 100 } = req.postDataJSON();
      return json([...objects].filter(p => p.startsWith(prefix + '/')).slice(offset, offset + limit).map(p => ({ name: p.split('/').at(-1), id: crypto.randomUUID() })));
    }
    if (path === '/storage/v1/object/establishments' && method === 'DELETE') {
      if (failDeleteStorage) return json({ message: 'storage unavailable', statusCode: '500' }, 500);
      for (const name of req.postDataJSON().prefixes) objects.delete(name);
      return json([]);
    }
    if (path.startsWith('/storage/v1/object/establishments/') && method === 'POST') {
      if (failUpload) return json({ message: 'upload rejected', statusCode: '403' }, 403);
      const name = decodeURIComponent(path.slice('/storage/v1/object/establishments/'.length));
      objects.add(name); return json({ Key: 'establishments/' + name, Id: crypto.randomUUID() });
    }
    if (path === '/rest/v1/establishments') {
      let selected = [...rows.values()];
      const id = url.searchParams.get('id')?.slice(3), slug = url.searchParams.get('slug')?.slice(3);
      if (id) selected = selected.filter(row => row.id === id);
      if (slug) selected = selected.filter(row => row.slug === slug);
      const authenticated = req.headers().authorization === 'Bearer ' + accessToken;
      if (method === 'GET') {
        if (!authenticated) selected = selected.filter(row => row.is_active && (!row.start_date || row.start_date <= '2026-09-22') && (!row.end_date || row.end_date >= '2026-09-22'));
        selected.sort((a, b) => a.display_order - b.display_order);
        if (req.headers().accept?.includes('vnd.pgrst.object')) return json(selected[0] || null);
        return json(selected);
      }
      assert.ok(authenticated, 'Operação administrativa deve usar a sessão autenticada');
      if (method === 'POST' || method === 'PATCH') {
        const payload = req.postDataJSON();
        for (const invalid of ['logo', 'cover_image', 'number', 'zip_code', 'instagram', 'website', 'price_range', 'is_mock', 'updated_at']) assert.ok(!(invalid in payload), `Coluna incorreta: ${invalid}`);
        if (method === 'POST') {
          if ([...rows.values()].some(row => row.slug === payload.slug)) return json({ code: '23505' }, 409);
          const row = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
          rows.set(row.id, row); return json(row, 201);
        }
        for (const row of selected) Object.assign(row, payload);
        return json(selected[0] || null);
      }
      if (method === 'DELETE') { selected.forEach(row => rows.delete(row.id)); return json(selected.map(row => ({ id: row.id }))); }
    }
    throw new Error(`Chamada inesperada: ${method} ${path}`);
  });
  const login = async () => {
    await page.goto(base + '/admin/login');
    await page.getByLabel('E-mail', { exact: true }).fill(user.email);
    await page.getByLabel('Senha', { exact: true }).fill('test-password');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  };
  badLogin = true;
  await login();
  await expect(page.getByRole('alert')).toContainText('Não foi possível entrar');
  badLogin = false; admin = false;
  await login();
  await expect(page.getByRole('alert')).toContainText('não possui acesso administrativo');
  admin = true;
  await login();
  await expect(page).toHaveURL(base + '/admin');
  await page.getByRole('link', { name: 'Novo estabelecimento' }).click();
  await page.locator('[name="name"]').fill('Café integração');
  await page.locator('[name="category"]').selectOption('Cafés');
  await page.locator('[name="number"]').fill('123');
  await page.locator('[name="zipCode"]').fill('37700-000');
  await page.locator('[name="instagram"]').fill('https://instagram.com/exemplo');
  const uploadInputs = page.locator('input[type="file"]');
  await uploadInputs.nth(0).setInputFiles({ name: 'arquivo.gif', mimeType: 'image/gif', buffer: png });
  await expect(page.getByRole('alert')).toContainText('JPG, PNG ou WebP');
  for (let i = 0; i < 3; i++) await uploadInputs.nth(i).setInputFiles({ name: 'Café logo.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('.upload-previews img')).toHaveCount(3);
  await page.getByRole('button', { name: 'Visualizar como aparece no site' }).click();
  await expect(page.locator('.admin-preview img')).toHaveAttribute('src', /^blob:/);
  await page.getByRole('button', { name: 'Cadastrar estabelecimento' }).click();
  await expect(page).toHaveURL(base + '/admin/establishments');
  await expect(page.getByRole('status')).toContainText('cadastrado com sucesso');
  assert.equal(rows.size, 1); assert.equal(objects.size, 3);
  const row = [...rows.values()][0];
  assert.equal(row.address_number, '123'); assert.equal(row.cep, '37700-000');
  assert.match(row.logo_url, /\/establishments\/logos\//);
  assert.match(row.cover_image_url, /\/establishments\/covers\//);
  assert.match(row.gallery[0], /\/establishments\/gallery\//);
  for (const path of objects) assert.match(path, /^[a-z]+\/[a-f0-9-]+\/[a-z0-9.-]+$/);
  await page.goto(base + '/lugares/cafe-integracao');
  await expect(page.locator('h1')).toHaveText('Café integração');
  const publicCall = calls.findLast(call => call.path === '/rest/v1/establishments' && call.search.includes('slug='));
  assert.notEqual(publicCall.authorization, 'Bearer ' + accessToken);
  const uploadsBeforeEdit = calls.filter(call => call.method === 'POST' && call.path.startsWith('/storage/v1/object/establishments/')).length;
  await page.goto(base + `/admin/establishments/${row.id}/edit`);
  await expect(page.locator('.upload-previews img')).toHaveCount(3);
  await page.locator('[name="shortDescription"]').fill('Descrição atualizada');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByRole('status')).toContainText('salvo com sucesso');
  assert.equal(calls.filter(call => call.method === 'POST' && call.path.startsWith('/storage/v1/object/establishments/')).length, uploadsBeforeEdit);
  await page.getByRole('button', { name: 'Remover galeria 1', exact: true }).click();
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect.poll(() => objects.size).toBe(2);
  await page.goto(base + '/admin/establishments');
  await page.getByRole('button', { name: 'Desativar Café integração' }).click();
  await expect(page.getByRole('status')).toContainText('desativado');
  await page.goto(base + '/lugares/cafe-integracao');
  await expect(page.locator('h1')).toContainText('não disponível');
  // Falha no upload deve desfazer o novo registro e permitir tentar novamente.
  failUpload = true;
  await page.goto(base + '/admin/establishments/new');
  await page.locator('[name="name"]').fill('Falha de upload');
  await page.locator('[name="category"]').selectOption('Cafés');
  await page.locator('input[type="file"]').first().setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: png });
  await page.getByRole('button', { name: 'Cadastrar estabelecimento' }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível enviar');
  assert.equal(rows.size, 1);
  failUpload = false;
  await page.getByRole('button', { name: 'Cadastrar estabelecimento' }).click();
  await expect(page).toHaveURL(base + '/admin/establishments');
  assert.equal(rows.size, 2);
  // Exclusão continua concluída mesmo se a limpeza do Storage falhar.
  failDeleteStorage = true;
  await page.getByRole('button', { name: 'Excluir Café integração' }).click();
  await page.getByRole('button', { name: 'Excluir', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Algumas imagens');
  assert.equal(rows.size, 1);
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  assert.deepEqual(exceptions, []);
  const unexpectedErrors = consoleErrors.filter(message => !/Failed to load resource.*(400|403|500)/.test(message));
  assert.deepEqual(unexpectedErrors, []);
  console.log('PASS contrato simulado: Auth, autorização, CRUD, mapper, upload, prévias, preservação, limpeza, falhas e logout.');
  await context.close();
} finally { await browser?.close(); await server.close(); }
