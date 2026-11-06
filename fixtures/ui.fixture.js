/**
 * Custom fixtures: Playwright creates these objects for each test automatically.
 * Tests just ask for what they need: async ({ loginPage, inventoryPage }) => {...}
 */
const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutInfoPage } = require('../pages/CheckoutInfoPage');
const { CheckoutOverviewPage } = require('../pages/CheckoutOverviewPage');
const { CheckoutCompletePage } = require('../pages/CheckoutCompletePage');
const { users } = require('../test-data/users');

const test = base.test.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutInfoPage: async ({ page }, use) => {
    await use(new CheckoutInfoPage(page));
  },
  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },

  // A ready-made "already logged in as standard_user" state.
  loggedInInventoryPage: async ({ loginPage, inventoryPage }, use) => {
    await loginPage.open();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
    await use(inventoryPage);
  },
});

module.exports = { test, expect: base.expect };
