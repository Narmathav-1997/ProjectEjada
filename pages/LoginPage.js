const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = this.byTestId('username');
    this.passwordInput = this.byTestId('password');
    this.loginButton = this.byTestId('login-button');
    this.errorMessage = this.byTestId('error');
    this.errorCloseButton = this.byTestId('error-button');
  }

  async open() {
    await this.goto('/');
    await expect(this.loginButton).toBeVisible();
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

module.exports = { LoginPage };
