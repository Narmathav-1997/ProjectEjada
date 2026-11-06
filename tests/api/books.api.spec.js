const { test, expect } = require('../../fixtures/api.fixture');
const { uniqueEmail, uniqueName } = require('../../utils/random');

test.describe('Simple Books API - public endpoints', () => {
  test('GET /status returns OK', async ({ books }) => {
    const res = await books.status();
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ status: 'OK' });
  });

  test('GET /books returns a list with the expected shape', async ({ books }) => {
    const res = await books.listBooks();
    expect(res.status()).toBe(200);
    const list = await res.json();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    for (const b of list) {
      expect(b).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        type: expect.stringMatching(/^(fiction|non-fiction)$/),
        available: expect.any(Boolean),
      });
    }
  });

  test('GET /books?type=fiction filters by type', async ({ books }) => {
    const list = await (await books.listBooks({ type: 'fiction' })).json();
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((b) => b.type === 'fiction')).toBe(true);
  });

  test('GET /books?limit=2 limits the number of results', async ({ books }) => {
    const list = await (await books.listBooks({ limit: 2 })).json();
    expect(list).toHaveLength(2);
  });

  test('GET /books with limit above 20 is rejected', async ({ books }) => {
    const res = await books.listBooks({ limit: 21 });
    expect(res.status()).toBe(400);
  });

  test('GET /books with an invalid type is rejected', async ({ books }) => {
    const res = await books.listBooks({ type: 'poetry' });
    expect(res.status()).toBe(400);
  });

  test('GET /books/:id returns a single book', async ({ books }) => {
    const res = await books.getBook(1);
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ id: 1, name: expect.any(String) });
  });

  test('GET /books/:id for a non-existing book returns 404', async ({ books }) => {
    const res = await books.getBook(999999);
    expect(res.status()).toBe(404);
  });
});

test.describe('Simple Books API - authentication', () => {
  test('POST /api-clients registers a new client and returns a token', async ({ books }) => {
    const res = await books.registerClient({
      clientName: uniqueName(),
      clientEmail: uniqueEmail(),
    });
    expect(res.status()).toBe(201);
    expect((await res.json()).accessToken).toEqual(expect.any(String));
  });

  test('POST /api-clients with an already registered email returns 409', async ({ books }) => {
    const client = { clientName: uniqueName(), clientEmail: uniqueEmail() };
    expect((await books.registerClient(client)).status()).toBe(201);
    const duplicate = await books.registerClient(client);
    expect(duplicate.status()).toBe(409);
    expect((await duplicate.json()).error).toMatch(/already registered/i);
  });

  test('POST /api-clients with missing fields returns 400', async ({ books }) => {
    const res = await books.registerClient({ clientName: uniqueName() });
    expect(res.status()).toBe(400);
  });
});

test.describe('Simple Books API - orders', () => {
  test('orders endpoints reject requests without a token (401)', async ({ books }) => {
    expect((await books.createOrder(null, { bookId: 1, customerName: 'x' })).status()).toBe(401);
    expect((await books.listOrders(null)).status()).toBe(401);
    expect((await books.updateOrder(null, 'abc', { customerName: 'x' })).status()).toBe(401);
    expect((await books.deleteOrder(null, 'abc')).status()).toBe(401);
  });

  test('orders endpoints reject an invalid token (401)', async ({ books }) => {
    const res = await books.listOrders('this-is-not-a-valid-token');
    expect(res.status()).toBe(401);
  });

  test('POST /orders with a token creates an order', async ({ books, apiToken }) => {
    const res = await books.createOrder(apiToken, { bookId: 1, customerName: uniqueName() });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.created).toBe(true);
    expect(body.orderId).toEqual(expect.any(String));

    await books.deleteOrder(apiToken, body.orderId); // cleanup
  });

  test('POST /orders with an invalid bookId returns 400', async ({ books, apiToken }) => {
    const res = await books.createOrder(apiToken, { bookId: 'abc', customerName: 'Tester' });
    expect(res.status()).toBe(400);
  });

  test('POST /orders without customerName returns 400', async ({ books, apiToken }) => {
    const res = await books.createOrder(apiToken, { bookId: 1 });
    expect(res.status()).toBe(400);
  });

  test('POST /orders for a book that is out of stock is rejected', async ({ books, apiToken }) => {
    const list = await (await books.listBooks()).json();
    const outOfStock = list.find((b) => b.available === false);
    test.skip(!outOfStock, 'No out-of-stock book is currently available in the API');

    const res = await books.createOrder(apiToken, { bookId: outOfStock.id, customerName: 'Tester' });
    expect(res.status()).toBe(404);
  });

  test('full order lifecycle: create -> read -> PATCH -> DELETE', async ({ books, apiToken }) => {
    const originalName = uniqueName('Original');
    const updatedName = uniqueName('Updated');
    let orderId;

    await test.step('create order (POST with token)', async () => {
      const res = await books.createOrder(apiToken, { bookId: 1, customerName: originalName });
      expect(res.status()).toBe(201);
      orderId = (await res.json()).orderId;
    });

    await test.step('order appears in GET /orders', async () => {
      const res = await books.listOrders(apiToken);
      expect(res.status()).toBe(200);
      const orders = await res.json();
      expect(orders.map((o) => o.id)).toContain(orderId);
    });

    await test.step('GET /orders/:id returns the order', async () => {
      const res = await books.getOrder(apiToken, orderId);
      expect(res.status()).toBe(200);
      expect(await res.json()).toMatchObject({ id: orderId, bookId: 1, customerName: originalName });
    });

    await test.step('PATCH /orders/:id updates customerName', async () => {
      const res = await books.updateOrder(apiToken, orderId, { customerName: updatedName });
      expect(res.status()).toBe(204);
      const check = await (await books.getOrder(apiToken, orderId)).json();
      expect(check.customerName).toBe(updatedName);
    });

    await test.step('DELETE /orders/:id removes the order', async () => {
      const res = await books.deleteOrder(apiToken, orderId);
      expect(res.status()).toBe(204);
      expect((await books.getOrder(apiToken, orderId)).status()).toBe(404);
    });
  });

  test('GET/PATCH/DELETE on a non-existing order return 404', async ({ books, apiToken }) => {
    const fake = 'does-not-exist-123';
    expect((await books.getOrder(apiToken, fake)).status()).toBe(404);
    expect((await books.updateOrder(apiToken, fake, { customerName: 'x' })).status()).toBe(404);
    expect((await books.deleteOrder(apiToken, fake)).status()).toBe(404);
  });
});
