import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/acceptance',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3333',
    headless: true,
    channel: 'chrome',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
  webServer: {
    command: 'node project-docs/serve.js',
    url: 'http://127.0.0.1:3333/project-docs/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 15 * 1000,
    env: {
      PORT: '3333',
      HOST: '127.0.0.1',
      NO_OPEN: '1',
    },
  },
});
