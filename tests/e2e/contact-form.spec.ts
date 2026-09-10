import { expect, test } from '@playwright/test';

test.describe('contact form', () => {
  test('shows the branch matching the chosen reason', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('.pl-branch--feature')).toBeVisible();
    await expect(page.locator('.pl-branch--error')).toBeHidden();

    await page.locator('label[for="reason-error"]').click();
    await expect(page.locator('.pl-branch--error')).toBeVisible();
    await expect(page.locator('.pl-branch--feature')).toBeHidden();
  });

  test('changes the submit label with the reason', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('label[for="reason-question"]').click();
    await expect(page.locator('.pl-submit-label--question')).toBeVisible();
    await expect(page.locator('.pl-submit-label--error')).toBeHidden();
  });

  test('counts the characters typed into the message', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('#message-field').fill('Hola');
    await expect(page.locator('#message-counter')).toHaveText('4 / 2000');
  });

  test('reports a malformed address after leaving the field', async ({ page }) => {
    await page.goto('/contact');
    const email = page.locator('#email-field');
    await email.fill('ana');
    await email.blur();
    await expect(page.locator('[data-email-error]')).toBeVisible();
    await expect(email).toHaveAttribute('aria-invalid', 'true');

    await email.fill('ana@ejemplo.com');
    await expect(page.locator('[data-email-error]')).toBeHidden();
  });

  test('keeps the browser from submitting an incomplete form', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('[data-submit-button]').click();
    await expect(page.locator('[data-form-status]')).toBeHidden();
  });

  test('surfaces a readable message when the endpoint fails', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 502, contentType: 'application/json', body: '{"status":"mail_failed"}' }),
    );
    await page.goto('/contact');
    await page.locator('#email-field').fill('ana@ejemplo.com');
    await page.locator('#message-field').fill('Un mensaje de prueba.');
    await page.locator('#intent-field').fill('Comparar dos algoritmos');
    await page.locator('label[for="accept-privacy"]').click();
    await page.locator('[data-submit-button]').click();
    const status = page.locator('[data-form-status]');
    await expect(status).toBeVisible();
    await expect(status).toHaveAttribute('data-tone', 'error');
  });

  test('confirms a successful submission and clears the form', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }),
    );
    await page.goto('/contact');
    await page.locator('#email-field').fill('ana@ejemplo.com');
    await page.locator('#message-field').fill('Un mensaje de prueba.');
    await page.locator('#intent-field').fill('Comparar dos algoritmos');
    await page.locator('label[for="accept-privacy"]').click();
    await page.locator('[data-submit-button]').click();
    await expect(page.locator('[data-form-status]')).toHaveAttribute('data-tone', 'success');
    await expect(page.locator('#message-field')).toHaveValue('');
  });

  test('custom dropdown opens, selects an option and syncs native select', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('label[for="reason-error"]').click();
    const trigger = page.locator('#platform-select-trigger');
    const menu = page.locator('#platform-select-menu');
    await expect(trigger).toBeVisible();

    await trigger.click();
    await expect(menu).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.locator('#platform-select-menu .pl-select__option[data-value="ios"]').click();
    await expect(menu).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#platform-select')).toHaveValue('ios');
  });

  test('custom dropdown supports keyboard navigation and closes on escape', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('label[for="reason-error"]').click();
    const trigger = page.locator('#platform-select-trigger');
    const menu = page.locator('#platform-select-menu');

    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(menu).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
