/**
 * BooksClient: the API equivalent of a Page Object.
 * One method per endpoint; tests never build URLs/headers by hand.
 * Every method returns the raw Playwright APIResponse so tests can assert
 * on status codes, headers and body.
 */
class BooksClient {
  /** @param {import('@playwright/test').APIRequestContext} request */
  constructor(request) {
    this.request = request;
  }

  _auth(token) {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ---- Public endpoints ----
  status() {
    return this.request.get('/status');
  }

  listBooks(params = {}) {
    return this.request.get('/books', { params });
  }

  getBook(bookId) {
    return this.request.get(`/books/${bookId}`);
  }

  // ---- Authentication ----
  registerClient({ clientName, clientEmail }) {
    return this.request.post('/api-clients/', { data: { clientName, clientEmail } });
  }

  // ---- Orders (token required) ----
  createOrder(token, body) {
    return this.request.post('/orders', { headers: this._auth(token), data: body });
  }

  listOrders(token) {
    return this.request.get('/orders', { headers: this._auth(token) });
  }

  getOrder(token, orderId) {
    return this.request.get(`/orders/${orderId}`, { headers: this._auth(token) });
  }

  updateOrder(token, orderId, body) {
    return this.request.patch(`/orders/${orderId}`, { headers: this._auth(token), data: body });
  }

  deleteOrder(token, orderId) {
    return this.request.delete(`/orders/${orderId}`, { headers: this._auth(token) });
  }
}

module.exports = { BooksClient };
