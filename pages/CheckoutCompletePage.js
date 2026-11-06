const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class CheckoutCompletePage extends BasePage {
  constructor(page) {
    super(page);
    this.title = this.byTestId('title');
    this.header = this.byTestId('complete-header');
    this.text = this.byTestId('complete-text');
    this.backHomeButton = this.byTestId('back-to-products');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.title).toHaveText('Checkout: Complete!');
  }
}

module.exports = { CheckoutCompletePage };
