# Ejada Playwright Automation Framework (JavaScript)

UI tests for [SauceDemo](https://www.saucedemo.com/) and API tests for the [Simple Books API](https://github.com/vdespa/introduction-to-postman-course/blob/main/simple-books-api.md), built with **Playwright Test**.

| Requirement | How it is met |
|---|---|
| Cross-browser (Chrome & Firefox) | Playwright *projects* `ui-chrome` and `ui-firefox` in `playwright.config.js` |
| Parallel execution | `fullyParallel: true` + multiple workers; tests are independent and use unique data |
| Page Object Model | `pages/` (UI) and `api/BooksClient.js` (API), injected through fixtures |
| Reports | Playwright HTML report + Allure report |
| UI scenarios | All login scenarios + full order (add to cart -> checkout -> finish) |
| API scenarios | GET, POST (with token), PATCH, DELETE + negative/auth cases |

## Project structure

```
├── playwright.config.js     # browsers, parallelism, reporters, retries
├── pages/                   # Page Objects (locators + actions)
├── api/BooksClient.js       # API client (one method per endpoint)
├── fixtures/                # ui.fixture.js, api.fixture.js (dependency injection)
├── test-data/               # users, messages, checkout data
├── utils/                   # env config, random data helpers
├── tests/
│   ├── ui/                  # login.spec.js, order.spec.js
│   └── api/                 # books.api.spec.js
└── .github/workflows/       # CI pipeline
```

## Setup

Prerequisites: **Node.js 18+** (and **Java 8+** only if you want to generate the Allure report).

```bash
npm install
npx playwright install --with-deps chromium firefox
cp .env.example .env     # optional: override URLs
```

## Running tests

```bash
npm test                 # everything: Chrome + Firefox UI + API, in parallel
npm run test:ui          # UI on both browsers
npm run test:chrome      # UI on Chrome only
npm run test:firefox     # UI on Firefox only
npm run test:api         # API only
npm run test:headed      # watch the browser (1 worker)
npm run test:debug       # Playwright Inspector
WORKERS=4 npm test       # choose number of parallel workers
```

Run one file / one test: `npx playwright test tests/ui/login.spec.js -g "locked out"`

## Reports

```bash
npm run report:html      # open Playwright HTML report (playwright-report/)
npm run allure:serve     # build + open Allure report from allure-results/ (needs Java)
# or
npm run allure:generate && npm run allure:open
```

Failures automatically keep a screenshot, video and trace (`npx playwright show-trace <trace.zip>`).

## Design decisions

- **Page Objects hold locators and actions, tests hold assertions.** Tests read like user stories.
- **Locators use `data-test` ids** (`testIdAttribute: 'data-test'`), the most stable option available.
- **Fixtures instead of `beforeEach` boilerplate:** tests just declare `{ loginPage, inventoryPage }`.
- **Data-driven tests:** login negatives are a table of cases -> one test each.
- **Parallel safe:** no shared state between tests; API tests create unique clients/orders and clean up. One API token per worker.
- **No hard waits:** Playwright auto-waits; assertions use web-first `expect(locator)`.
- **Config via environment:** `UI_BASE_URL`, `API_BASE_URL`, `WORKERS`.

## Notes

- The API base URL defaults to `https://simple-books-api.glitch.me`. If the host has moved, set `API_BASE_URL` in `.env`.
- Public API quirk: registering the same email twice returns **409**; the tests generate unique emails.
- `performance_glitch_user` is intentionally slow, so that test uses `test.slow()` (3x timeout).

## Possible improvements

Reuse login via `storageState`, add visual comparisons for `visual_user`, schema validation for API responses (e.g. Ajv), ESLint/Prettier + Husky pre-commit hooks, TypeScript migration.
