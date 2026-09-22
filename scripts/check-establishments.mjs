import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const base = process.env.BASE_URL || 'http://localhost:5174';
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const goto = async path => { await page.goto(base + path); await page.locator('h1').waitFor(); };
try {
  await goto('/lugares');
  assert.equal(await page.evaluate(async () => (await import('/src/lib/supabase.js')).isMockMode), true, 'Este teste exige VITE_DATA_MODE=mock em um servidor de desenvolvimento isolado.');
  await expect(page.locator('.place-card')).toHaveCount(6);
  await page.getByRole('button', { name: 'Cafés', exact: true }).click();
  await expect(page.locator('.place-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Todos', exact: true }).click();
  await page.getByRole('searchbox').fill('bistro');
  await expect(page.locator('.place-card')).toHaveCount(1);
  await page.getByRole('searchbox').fill('inexistente');
  await expect(page.locator('.places-empty')).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await page.getByRole('link', { name: 'Conhecer Café Alameda — Exemplo' }).click();
  await expect(page.locator('h1')).toContainText('Café Alameda');
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(1);
  await expect(page.locator('a[href^="https://wa.me/"]')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Ver no mapa' })).toHaveAttribute('target', '_blank');
  await goto('/lugares/atelie-central');
  await expect(page.locator('a[href^="https://wa.me/"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Ver no mapa' })).toHaveCount(0);
  console.log('PASS public search, categories, details and optional contacts');

  const rules = await page.evaluate(async () => {
    const u = await import('/src/utils/establishments.js');
    const phones = await import('/src/utils/phone.js');
    const sample = { isActive: true, startDate: '2026-09-01', endDate: '2026-09-30' };
    return [u.campaignStatus(sample, '2026-09-30'), u.campaignStatus(sample, '2026-10-01'), u.campaignStatus(sample, '2026-08-31'), u.campaignStatus({ ...sample, isActive: false }, '2026-09-01'), phones.normalizePhone('(35) 99999-9999'), u.safeUrl('javascript:alert(1)')];
  });
  assert.deepEqual(rules, ['ATIVO', 'EXPIRADO', 'AGENDADO', 'INATIVO', '5535999999999', '']);
  await page.goto(base + '/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel('E-mail', { exact: true }).fill('admin@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('errada');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('Senha', { exact: true }).fill('demo123');
  await page.getByRole('button', { name: 'Mostrar senha' }).click();
  await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('link', { name: 'Novo estabelecimento' }).click();
  await page.locator('[name="name"]').fill('Lugar de teste automatizado');
  await page.locator('[name="category"]').selectOption('Cafés');
  await page.locator('[name="shortDescription"]').fill('Cadastro de teste do fluxo completo.');
  await page.locator('[name="phone"]').fill('00000000000');
  await page.locator('[name="whatsapp"]').fill('00000000000');
  await page.locator('[name="mapsUrl"]').fill('https://example.com/maps');
  await page.locator('[name="instagram"]').fill('https://example.com/instagram');
  await page.locator('[name="website"]').fill('https://example.com');
  await page.getByLabel('Cadastro fictício de demonstração').check();
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
  await page.locator('input[type="file"]').nth(1).setInputFiles({ name: 'teste.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('.upload-previews img')).toHaveCount(1);
  await page.locator('input[type="file"]').nth(2).setInputFiles({ name: 'galeria.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('.upload-previews img')).toHaveCount(2);
  await page.getByRole('button', { name: 'Adicionar horário' }).click();
  await page.getByLabel('Dia', { exact: true }).fill('Segunda');
  await page.getByLabel('Horário', { exact: true }).fill('08:00 às 18:00');
  await page.getByRole('button', { name: 'Visualizar como aparece no site' }).click();
  await expect(page.locator('.admin-preview')).toContainText('Lugar de teste automatizado');
  await page.getByRole('button', { name: 'Cadastrar estabelecimento' }).click();
  await expect(page).toHaveURL(/\/admin\/establishments$/);
  await page.getByRole('link', { name: 'Editar Lugar de teste automatizado' }).click();
  await expect(page).toHaveURL(/\/admin\/establishments\/[^/]+\/edit$/);
  const editUrl = page.url();
  await page.reload();
  await expect(page.locator('[name="name"]')).toHaveValue('Lugar de teste automatizado');
  await expect(page.locator('.upload-previews img')).toHaveCount(2);
  await page.locator('[name="shortDescription"]').fill('Descrição editada e persistida.');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByRole('status')).toContainText('salvo com sucesso');
  await goto('/lugares/lugar-de-teste-automatizado');
  await expect(page.locator('.place-gallery img')).toHaveCount(1);
  await expect(page.locator('.opening-hours')).toContainText('Segunda');
  await expect(page.locator('.place-cover img')).toHaveAttribute('src', /^data:image/);
  await goto('/admin/establishments');
  await page.getByRole('button', { name: 'Desativar Lugar de teste automatizado' }).click();
  await expect(page.getByRole('status')).toContainText('desativado');
  await goto('/lugares/lugar-de-teste-automatizado');
  await expect(page.locator('h1')).toContainText('não disponível');
  await goto('/admin/establishments');
  await page.getByRole('button', { name: 'Ativar Lugar de teste automatizado' }).click();
  await expect(page.getByRole('status')).toContainText('ativado');
  await page.getByRole('button', { name: 'Excluir Lugar de teste automatizado' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Excluir Lugar de teste automatizado' }).click();
  await page.getByRole('button', { name: 'Excluir', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('excluído');
  await page.reload();
  await expect(page.locator('.admin-table')).not.toContainText('Lugar de teste automatizado');
  console.log('PASS mock auth, CRUD, media persistence, preview, gallery, hours and deletion modal');

  const campaignResults = await page.evaluate(async () => {
    const { establishmentsService: service } = await import('/src/services/establishmentsService.js');
    const created = [];
    for (const [name, data] of [['Futuro', { startDate: '2099-01-01' }], ['Passado', { endDate: '2000-01-01' }], ['Inativo', { isActive: false }]]) created.push(await service.create({ name, category: 'Cafés', ...data }));
    const publicIds = (await service.getPublic()).map(item => item.id);
    const hidden = created.every(item => !publicIds.includes(item.id));
    const bySlug = await Promise.all(created.map(item => service.getBySlug(item.slug)));
    let duplicate = false, dates = false;
    try { await service.create({ name: 'Futuro', category: 'Cafés' }); } catch { duplicate = true; }
    try { await service.create({ name: 'Datas inválidas', category: 'Cafés', startDate: '2026-10-01', endDate: '2026-09-01' }); } catch { dates = true; }
    return { hidden, bySlug, duplicate, dates };
  });
  assert.deepEqual(campaignResults, { hidden: true, bySlug: [null, null, null], duplicate: true, dates: true });
  console.log('PASS scheduled/expired/inactive visibility, duplicate slug and invalid dates');

  for (const width of [375, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const path of ['/lugares', '/lugares/cafe-alameda', '/admin', '/admin/establishments', '/admin/establishments/new']) {
      await goto(path);
      await page.evaluate(() => document.fonts.ready);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow ${width} ${path}`);
      if (path === '/admin' && width < 900) {
        await page.getByRole('button', { name: 'Abrir navegação' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
      }
      if (width === 375 || width === 1440) await page.screenshot({ path: `test-results/feature-${width}-${path.replaceAll('/', '-')}.png`, fullPage: true });
    }
    console.log(`PASS responsive ${width}px: public, details, dashboard, list, form and drawer`);
  }
  assert.deepEqual(errors, []);
  console.log('PASS no browser exceptions');
} finally { await context.close(); await browser.close(); }
