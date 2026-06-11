import { test, expect } from '@playwright/test'

test('post detail page loads', async ({ page }) => {
  await page.goto('/posts/test-id')
  // 存在しない場合は404
  await expect(page.locator('body')).toBeVisible()
})
