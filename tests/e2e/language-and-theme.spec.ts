import { expect, test } from '@playwright/test';

test.describe('language switch', () => {
  test('moves to the same page in the other language', async ({ page }) => {
    await page.goto('/versions');
    await page.locator('header a[data-language-choice="en"]').first().click();
    await expect(page).toHaveURL(/\/en\/versions$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('remembers the chosen language', async ({ page }) => {
    await page.goto('/');
    await page.locator('header a[data-language-choice="en"]').first().click();
    const stored = await page.evaluate(() => localStorage.getItem('pseudolearn-language'));
    expect(stored).toBe('en');
  });

  test('offers english to an english browser and never redirects on its own', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-GB' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[data-language-notice]')).toBeVisible();
    await page.locator('[data-language-dismiss]').click();
    await expect(page.locator('[data-language-notice]')).toBeHidden();
    await context.close();
  });

  test('hides the notice for a spanish browser', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'es-PE' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('[data-language-notice]')).toBeHidden();
    await context.close();
  });

  test('renders the localized product preview per language', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.product-preview__file')).toHaveText('DemostracionGuiada.pseudo');
    await page.goto('/en');
    await expect(page.locator('.product-preview__file')).toHaveText('GuidedDemo.pseudo');
  });
});

test.describe('theme switch', () => {
  test('applies and persists the chosen theme', async ({ page }) => {
    await page.goto('/');
    await page.locator('header button[data-theme-choice="dark"]').first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('marks the active option for assistive technology', async ({ page }) => {
    await page.goto('/');
    const light = page.locator('header button[data-theme-choice="light"]').first();
    await light.click();
    await expect(light).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('header button[data-theme-choice="dark"]').first()).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
