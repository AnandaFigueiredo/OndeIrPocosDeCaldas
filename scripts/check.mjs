import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('test-results', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const errors = [];
const baseUrl = process.env.BASE_URL || 'http://localhost:5174';
page.on('pageerror', e => errors.push(e.message));
try {
  for (const width of [375, 390, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto(baseUrl);
    await page.locator('h1').waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('h1').count(), 1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
    for (const href of await page.locator('a[href^="#"]').evaluateAll(els => els.map(el => el.getAttribute('href')))) {
      assert.equal(await page.locator(href).count(), 1, `Missing target ${href}`);
    }
    if (width <= 1100) {
      const toggle = page.locator('.menu-toggle');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      await toggle.click();
      await page.locator('#navigation').getByRole('link', { name: 'Sobre', exact: true }).click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    }
    await page.locator('#contato').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('#contato .button').getAttribute('href'), 'https://www.instagram.com/ondeirpocosdecaldas/');
    await page.screenshot({ path: `test-results/site-${width}.png`, fullPage: true });
    console.log(`PASS ${width}px: overflow, anchors, menu, contact`);
  }
  assert.deepEqual(errors, [], 'Browser errors');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(baseUrl);
  await page.locator('h1').waitFor();
  await page.locator('#sobre').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  assert.equal(await page.locator('#sobre').evaluate(el => getComputedStyle(el).opacity), '1');
  console.log('PASS reveal animation and browser console');
} finally { await browser.close(); }
