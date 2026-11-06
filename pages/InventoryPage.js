const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class InventoryPage extends BasePage {
  constructor(page) {
    super(page);
    this.title = this.byTestId('title');
    this.items = this.byTestId('inventory-item');
    this.cartLink = this.byTestId('shopping-cart-link');
    this.cartBadge = this.byTestId('shopping-cart-badge');
    this.menuButton = this.page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = this.byTestId('logout-sidebar-link');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.title).toHaveText('Products');
  }

  /** "Sauce Labs Backpack" -> "add-to-cart-sauce-labs-backpack" */
  _addButton(productName) {
    const slug = productName.toLowerCase().replace(/\s+/g, '-');
    return this.byTestId(`add-to-cart-${slug}`);
  }

  async addProductToCart(productName) {
    await this._addButton(productName).click();
  }

  async openCart() {
    await this.cartLink.click();
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}

module.exports = { InventoryPage };
