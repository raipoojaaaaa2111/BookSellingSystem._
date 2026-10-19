const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — middleware that verifies a JWT and attaches the user to req.user.
 *
 * What it checks (in order):
 * 1. Is there an Authorization header with a Bearer token?
 * 2. Is the token on the blacklist? (logged out tokens)
 * 3. Is the token valid and not expired?
 * 4. Does the user still exist in the database?
 *
 * If all pass → req.user is set and the route handler runs.
 * If any fail → 401 Unauthorized is returned immediately.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  // Check if this token was blacklisted (user already logged out)
  // We import lazily to avoid circular dependency issues
  const { tokenBlacklist } = require('../controllers/authController');
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({
      success: false,
      message: 'Token has been invalidated, please log in again',
    });
  }

  try {
    // jwt.verify throws if the token is expired or tampered with
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // findByPk = find by primary key (the id column)
    // default scope automatically excludes the password field
    req.user = await User.findByPk(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed or expired',
    });
  }
};

/**
 * authorize — role-based access control middleware.
 * Always use AFTER protect.
 *
 * Usage: router.delete('/user/:id', protect, authorize('platform_admin'), handler)
 *
 * If the user's role is not in the allowed list → 403 Forbidden
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Your role '${req.user.role}' is not allowed to perform this action`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
