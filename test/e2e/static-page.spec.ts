import { test, expect } from '@playwright/test';

test.describe('Static Page', () => {
  test('should load homepage and display correct content', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    await expect(page).toHaveTitle(/Weather App/);
    await expect(page.locator('h1')).toHaveText('Subscribe to weather updates');
    await expect(page.locator('input[name="email"]')).toHaveValue('');
    await expect(page.locator('input[name="city"]')).toHaveValue('');
    await expect(page.locator('select[name="frequency"]')).toHaveValue(
      'hourly',
    );
    await expect(page.locator('button[type="submit"]')).toHaveText('Subscribe');
  });

  test('should submit the form and navigate to the confirmation page', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="city"]', 'New York');
    await page.selectOption('select[name="frequency"]', 'hourly');
    await page.click('button[type="submit"]');

    await expect(page.locator('pre')).toContainText(
      'Subscription created successfully. Confirmation email sent.',
    );
  });

  test('should show error message when email is already subscribed', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="city"]', 'New York');
    await page.selectOption('select[name="frequency"]', 'hourly');
    await page.click('button[type="submit"]');

    await expect(page.locator('pre')).toContainText(
      'Subscription already exists',
    );
  });
});
