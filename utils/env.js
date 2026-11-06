// Single place for environment-driven settings, used by config AND fixtures.
require('dotenv').config();

module.exports = {
  UI_BASE_URL: process.env.UI_BASE_URL || 'https://www.saucedemo.com',
  API_BASE_URL: process.env.API_BASE_URL || 'https://simple-books-api.glitch.me',
};
