// Helpers to generate unique test data (important when tests run in parallel).
function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
}

function uniqueEmail(prefix = 'qa') {
  return `${prefix}.${uniqueSuffix()}@example.com`;
}

function uniqueName(prefix = 'QA User') {
  return `${prefix} ${uniqueSuffix()}`;
}

module.exports = { uniqueSuffix, uniqueEmail, uniqueName };
