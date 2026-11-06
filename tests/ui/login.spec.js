const { test, expect } = require('../../fixtures/ui.fixture');
const { users, loginErrors } = require('../../test-data/users');

test.describe('Login', () => {
  test.describe('valid users', () => {
    // Data-driven: one test is generated per user.
    const loginAllowed = [
      ['standard', users.standard],
      ['problem', users.problem],
      ['performance glitch', users.performanceGlitch],
      ['error', users.error],
      ['visual', users.visual],
    ];

    for (const [label, user] of loginAllowed) {
      test(`${label} user can log in`, async ({ loginPage, inventoryPage }) => {
        test.slow(); // performance_glitch_user is intentionally slow
        await loginPage.open();
        await loginPage.login(user.username, user.password);
        await inventoryPage.expectLoaded();
      });
    }
  });

  test.describe('invalid attempts', () => {
    const negativeCases = [
      {
        name: 'locked out user is rejected',
        username: users.lockedOut.username,
        password: users.lockedOut.password,
        error: loginErrors.lockedOut,
      },
      {
        name: 'wrong password is rejected',
        username: users.standard.username,
        password: 'wrong_password',
        error: loginErrors.invalidCredentials,
      },
      {
        name: 'unknown username is rejected',
        username: 'not_a_user',
        password: users.standard.password,
        error: loginErrors.invalidCredentials,
      },
      {
        name: 'empty username shows required message',
        username: '',
        password: users.standard.password,
        error: loginErrors.usernameRequired,
      },
      {
        name: 'empty password shows required message',
        username: users.standard.username,
        password: '',
        error: loginErrors.passwordRequired,
      },
      {
        name: 'both fields empty shows username required',
        username: '',
        password: '',
        error: loginErrors.usernameRequired,
      },
      {
        name: 'username is case sensitive',
        username: 'STANDARD_USER',
        password: users.standard.password,
        error: loginErrors.invalidCredentials,
      },
    ];

    for (const c of negativeCases) {
      test(c.name, async ({ loginPage, page }) => {
        await loginPage.open();
        await loginPage.login(c.username, c.password);
        await expect(loginPage.errorMessage).toHaveText(c.error);
        await expect(page).not.toHaveURL(/inventory\.html/);
      });
    }
  });

  test('error message can be dismissed', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toBeVisible();
    await loginPage.errorCloseButton.click();
    await expect(loginPage.errorMessage).toBeHidden();
  });

  test('inventory page is protected when not logged in', async ({ loginPage, page }) => {
    await page.goto('/inventory.html');
    await expect(loginPage.errorMessage).toHaveText(loginErrors.notLoggedIn);
  });

  test('user can log out', async ({ loggedInInventoryPage, loginPage }) => {
    await loggedInInventoryPage.logout();
    await expect(loginPage.loginButton).toBeVisible();
  });
});
