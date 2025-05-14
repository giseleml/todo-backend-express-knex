const crypto = require('crypto');

/**
 * Generates a random UUID v4
 * @returns {string} A random UUID v4 string
 */
function generateUUID () {
  return crypto.randomUUID();
}

module.exports = {
  generateUUID
}; 