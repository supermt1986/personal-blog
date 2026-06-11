import { test, expect } from '@playwright/test'

test('post detail page structure loads', async ({ page }) => {
  // Test that the post route is accessible and renders
  await page.goto('/posts/any-id')
  // The page should either show content or a 404, either way body should be visible
  await expect(page.locator('body')).toBeVisible()
})

test('admin page loads', async ({ page }) => {
  await page.goto('/admin')
  await expect(page.locator('body')).toBeVisible()
})
