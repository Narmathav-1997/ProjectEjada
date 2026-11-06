const { test, expect } = require('../../fixtures/ui.fixture');
const { checkoutInfo, checkoutErrors, PRODUCT } = require('../../test-data/checkout');

test.describe('Product order', () => {
  test('logged-in user completes a full order with one product', async ({
    loggedInInventoryPage: inventory,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await test.step('Add one product to the cart', async () => {
      await inventory.addProductToCart(PRODUCT);
      await expect(inventory.cartBadge).toHaveText('1');
    });

    await test.step('Review the cart', async () => {
      await inventory.openCart();
      await cartPage.expectLoaded();
      await expect(cartPage.items).toHaveCount(1);
      await expect(cartPage.itemNames).toHaveText(PRODUCT);
    });

    await test.step('Enter checkout information', async () => {
      await cartPage.checkout();
      await checkoutInfoPage.expectLoaded();
      await checkoutInfoPage.fillInformation(checkoutInfo);
      await checkoutInfoPage.continue();
    });

    await test.step('Verify overview and finish', async () => {
      await checkoutOverviewPage.expectLoaded();
      await expect(checkoutOverviewPage.itemNames).toHaveText(PRODUCT);
      await expect(checkoutOverviewPage.subtotal).toContainText('$29.99');
      await checkoutOverviewPage.finish();
    });

    await test.step('Verify order confirmation', async () => {
      await checkoutCompletePage.expectLoaded();
      await expect(checkoutCompletePage.header).toHaveText('Thank you for your order!');
      await expect(inventory.cartBadge).toBeHidden(); // cart is emptied
    });
  });

  test.describe('checkout information validation', () => {
    const cases = [
      { name: 'first name', info: { ...checkoutInfo, firstName: '' }, error: checkoutErrors.firstNameRequired },
      { name: 'last name', info: { ...checkoutInfo, lastName: '' }, error: checkoutErrors.lastNameRequired },
      { name: 'postal code', info: { ...checkoutInfo, postalCode: '' }, error: checkoutErrors.postalCodeRequired },
    ];

    for (const c of cases) {
      test(`missing ${c.name} is rejected`, async ({
        loggedInInventoryPage: inventory,
        cartPage,
        checkoutInfoPage,
      }) => {
        await inventory.addProductToCart(PRODUCT);
        await inventory.openCart();
        await cartPage.checkout();
        await checkoutInfoPage.fillInformation(c.info);
        await checkoutInfoPage.continue();
        await expect(checkoutInfoPage.errorMessage).toHaveText(c.error);
      });
    }
  });
});
