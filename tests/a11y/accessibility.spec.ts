import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = [
  '/',
  '/contact',
  '/versions',
  '/privacy',
  '/terms',
  '/en',
  '/en/contact',
  '/en/versions',
  '/en/privacy',
  '/en/terms',
];
const THEMES = ['light', 'dark'] as const;

for (const route of ROUTES) {
  for (const theme of THEMES) {
    test(`${route} has no serious accessibility violations in ${theme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const blocking = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      );
      expect(blocking.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
    });
  }
}

test('every interactive control keeps a visible focus ring', async ({ page }) => {
  await page.goto('/contact');
  const outline = await page.locator('#email-field').evaluate((element) => {
    element.focus();
    return getComputedStyle(element).boxShadow;
  });
  expect(outline).not.toBe('none');
});

test('the mobile menu closes with the escape key', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('[data-mobile-menu] summary').click();
  await expect(page.locator('[data-mobile-menu]')).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-mobile-menu]')).not.toHaveAttribute('open', '');
});
