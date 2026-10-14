const jwt = require('jsonwebtoken');

/**
 * generateToken — creates a signed JWT containing the user's ID.
 *
 * @param {string} id - the MongoDB _id of the user
 * @param {string} type - 'access' (short-lived) or 'refresh' (long-lived)
 * @returns {string} signed JWT string
 *
 * The frontend stores the access token in memory and uses the refresh token
 * (sent as an httpOnly cookie) to get a new access token when it expires.
 */
const generateToken = (id, type = 'access') => {
  const secret =
    type === 'access'
      ? process.env.JWT_ACCESS_SECRET
      : process.env.JWT_REFRESH_SECRET;

  const expiresIn = type === 'access' ? '15m' : '7d';

  return jwt.sign({ id }, secret, { expiresIn });
};

module.exports = generateToken;
