const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class CheckoutOverviewPage extends BasePage {
  constructor(page) {
    super(page);
    this.title = this.byTestId('title');
    this.itemNames = this.byTestId('inventory-item-name');
    this.subtotal = this.byTestId('subtotal-label');
    this.tax = this.byTestId('tax-label');
    this.total = this.byTestId('total-label');
    this.finishButton = this.byTestId('finish');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    await expect(this.title).toHaveText('Checkout: Overview');
  }

  async finish() {
    await this.finishButton.click();
  }
}

module.exports = { CheckoutOverviewPage };
