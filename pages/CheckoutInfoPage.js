const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class CheckoutInfoPage extends BasePage {
  constructor(page) {
    super(page);
    this.title = this.byTestId('title');
    this.firstName = this.byTestId('firstName');
    this.lastName = this.byTestId('lastName');
    this.postalCode = this.byTestId('postalCode');
    this.continueButton = this.byTestId('continue');
    this.errorMessage = this.byTestId('error');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
    await expect(this.title).toHaveText('Checkout: Your Information');
  }

  async fillInformation({ firstName, lastName, postalCode }) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.postalCode.fill(postalCode);
  }

  async continue() {
    await this.continueButton.click();
  }
}

module.exports = { CheckoutInfoPage };
