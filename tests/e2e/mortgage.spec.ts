import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('renders a real result before JavaScript runs', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/mortgage-or-isa/');
  await expect(page.locator('.headline-lead')).toContainText('simulated futures');
  await ctx.close();
});

test('changing an input recomputes and updates the URL', async ({ page }) => {
  await page.goto('/mortgage-or-isa/');
  const lead = page.locator('.headline-lead');
  const median = page.locator('.stat-value').nth(1);
  const before = await median.textContent();
  await page.getByLabel('Spare cash each month').fill('1500');
  await expect(page).toHaveURL(/spare=1500/);
  await expect(median).not.toHaveText(before ?? '', { timeout: 10_000 });
  await expect(lead).toBeVisible();
});

test('a shared link reproduces the inputs and assumptions', async ({ page }) => {
  await page.goto('/mortgage-or-isa/?isa=cash&spare=500&a.cash.spread=-0.5&v=1');
  await expect(page.getByRole('radio', { name: 'Cash ISA' })).toBeChecked();
  await expect(page.getByLabel('Spare cash each month')).toHaveValue('500');
  await expect(page.locator('.assumptions-bar')).toContainText('1 assumption changed');
  await expect(page.locator('.headline-lead')).toContainText('overpaying', { timeout: 10_000 });
});

test('editing an assumption recomputes and can be reset', async ({ page }) => {
  await page.goto('/mortgage-or-isa/');
  await page.getByText('Investments', { exact: true }).click();
  const field = page.getByRole('textbox', { name: 'Shares: long-run yearly return after inflation' });
  await field.fill('1');
  await field.blur();
  await expect(page).toHaveURL(/a\.eq\.return=1/);
  await expect(page.locator('.headline-lead')).toContainText('overpaying', { timeout: 10_000 });
  await page.getByRole('button', { name: 'Reset all to defaults' }).click();
  await expect(page).not.toHaveURL(/a\.eq\.return/);
});

test('sensitivity analysis arrives with flip points', async ({ page }) => {
  await page.goto('/mortgage-or-isa/');
  await expect(page.locator('.flips li').first()).toContainText(/stays ahead/);
});

test('no horizontal scrolling', async ({ page }) => {
  await page.goto('/mortgage-or-isa/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

for (const path of ['/', '/mortgage-or-isa/', '/how-it-works/', '/assumptions/', '/sources/', '/about/']) {
  test(`accessibility: ${path} has no WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([]);
  });
}

test('works under the production Content-Security-Policy', async ({ page }) => {
  const toml = (await import('node:fs')).readFileSync('netlify.toml', 'utf8');
  const csp = /Content-Security-Policy = "([^"]+)"/.exec(toml)![1];
  const violations: string[] = [];
  page.on('console', (m) => {
    if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text());
  });
  await page.route('**/*', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': csp } });
  });
  await page.goto('/mortgage-or-isa/');
  const median = page.locator('.stat-value').nth(1);
  const before = await median.textContent();
  await page.getByLabel('Spare cash each month').fill('900');
  await expect(page).toHaveURL(/spare=900/);
  // The new result can only arrive if the Web Worker is allowed to run.
  await expect(median).not.toHaveText(before ?? '', { timeout: 15_000 });
  await page.locator('.chart-focus').first().hover();
  expect(violations).toEqual([]);
});
