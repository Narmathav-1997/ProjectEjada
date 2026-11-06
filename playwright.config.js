// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { UI_BASE_URL, API_BASE_URL } = require('./utils/env');

module.exports = defineConfig({
  testDir: './tests',

  // ---- Parallel execution ----
  fullyParallel: true, // run tests inside a file in parallel too
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : process.env.CI ? 2 : undefined,

  // ---- Stability ----
  forbidOnly: !!process.env.CI, // fail CI if someone leaves test.only
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  expect: { timeout: 7_000 },

  // ---- Reporting (HTML + Allure + console) ----
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['allure-playwright', { resultsDir: 'allure-results', detail: true }],
  ],

  // ---- Defaults for every test ----
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // ---- Cross-browser: each "project" is one browser/target ----
  projects: [
    {
      name: 'ui-chrome',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: UI_BASE_URL,
        testIdAttribute: 'data-test', // SauceDemo uses data-test, not data-testid
      },
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: UI_BASE_URL,
        testIdAttribute: 'data-test',
      },
    },
    {
      // API tests need no browser at all
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_BASE_URL,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
