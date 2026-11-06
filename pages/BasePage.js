/**
 * BasePage: shared behaviour for every page object.
 * Page objects hold LOCATORS (how to find things) and ACTIONS (what a user does).
 * They never contain assertions about test intent - tests do that.
 * (Small "expectLoaded" helpers are the one exception, to verify navigation.)
 */
class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto(path = '/') {
    await this.page.goto(path);
  }

  /** Locate by the app's test-id attribute (configured as data-test). */
  byTestId(id) {
    return this.page.getByTestId(id);
  }
}

module.exports = { BasePage };
