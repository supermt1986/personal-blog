import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.{test,spec}.ts?(x)'],
    exclude: ['**/node_modules/**', '**/cdk/**', 'tests/e2e/**']
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
})