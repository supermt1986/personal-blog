import { test, expect } from '@playwright/test'

test('home page shows posts', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Latest Articles')
})

test('navigation works', async ({ page }) => {
  await page.goto('/')
  await page.click('text=カテゴリ')
  await expect(page).toHaveURL(/\/categories/)
})
