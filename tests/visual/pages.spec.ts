import { expect, test } from '@playwright/test';

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/contact', name: 'contact' },
  { path: '/versions', name: 'versions' },
];

const VIEWPORTS = [
  { width: 390, height: 844, name: 'mobile' },
  { width: 1440, height: 900, name: 'desktop' },
];

for (const route of ROUTES) {
  for (const viewport of VIEWPORTS) {
    test(`${route.name} looks unchanged on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(route.path);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${route.name}-${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
}
