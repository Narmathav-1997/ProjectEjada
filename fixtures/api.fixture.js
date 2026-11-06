const base = require('@playwright/test');
const { BooksClient } = require('../api/BooksClient');
const { API_BASE_URL } = require('../utils/env');
const { uniqueEmail, uniqueName } = require('../utils/random');

const test = base.test.extend({
  // `request` is Playwright's built-in HTTP client; baseURL comes from the config.
  books: async ({ request }, use) => {
    await use(new BooksClient(request));
  },

  // Worker-scoped: register ONE API client per worker and reuse its token for
  // all tests in that worker (fast, and safe for parallel runs).
  apiToken: [
    async ({ playwright }, use) => {
      const ctx = await playwright.request.newContext({ baseURL: API_BASE_URL });
      const client = new BooksClient(ctx);
      const res = await client.registerClient({
        clientName: uniqueName('Worker'),
        clientEmail: uniqueEmail('worker'),
      });
      if (res.status() !== 201) {
        throw new Error(`Could not register API client: ${res.status()} ${await res.text()}`);
      }
      const { accessToken } = await res.json();
      await use(accessToken);
      await ctx.dispose();
    },
    { scope: 'worker' },
  ],
});

module.exports = { test, expect: base.expect };
