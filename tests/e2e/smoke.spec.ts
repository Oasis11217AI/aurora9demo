import { test, expect } from '@playwright/test';

test.describe('AURORA9 seeded demos', () => {
  test('Governance flow', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByRole('button', { name: 'Start Demo' }).click();
    const approveBtn = page.getByRole('button', { name: 'Approve Changes' });
    await expect(approveBtn).toBeDisabled();
    await expect(approveBtn).toBeEnabled({ timeout: 10000 });
    await approveBtn.click();
    await page.getByRole('button', { name: 'Show details' }).first().click();
    await expect(page.getByText(/Receipt created/i)).toBeVisible();
  });

  test('PPC smoke', async ({ page }) => {
    await page.goto('http://localhost:3000/ads');
    await page.getByRole('button', { name: 'Start PPC Run' }).click();
    await expect(page.getByText('Propose Bids')).toBeVisible();
  });

  test('Inventory smoke', async ({ page }) => {
    await page.goto('http://localhost:3000/inventory');
    await page.getByRole('button', { name: 'Start Demo' }).click();
    await expect(page.getByText('Decision')).toBeVisible();
  });

  test('Compliance smoke', async ({ page }) => {
    await page.goto('http://localhost:3000/compliance');
    await page.getByRole('button', { name: 'Start Compliance Run' }).click();
    await expect(page.getByText('Approval Checkpoint')).toBeVisible();
  });

  test('Pricing smoke', async ({ page }) => {
    await page.goto('http://localhost:3000/pricing');
    await page.getByRole('button', { name: 'Start Pricing Run' }).click();
    await expect(page.getByText('Constraints')).toBeVisible();
  });
});
