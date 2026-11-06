const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class CartPage extends BasePage {
  constructor(page) {
    super(page);
    this.title = this.byTestId('title');
    this.items = this.byTestId('inventory-item');
    this.itemNames = this.byTestId('inventory-item-name');
    this.checkoutButton = this.byTestId('checkout');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.title).toHaveText('Your Cart');
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}

module.exports = { CartPage };
