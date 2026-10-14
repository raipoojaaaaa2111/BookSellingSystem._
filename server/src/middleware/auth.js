const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — middleware that verifies a JWT and attaches the user to req.user.
 * If the token is invalid or missing, it rejects the request with 401.
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in the Authorization header
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

  try {
    // Verify the token — throws if expired or tampered with
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Sequelize: findByPk = "find by primary key" (the `id` column)
    // The default scope automatically excludes the password field
    req.user = await User.findByPk(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

/**
 * authorize — checks if req.user has one of the permitted roles.
 * Always use AFTER the protect middleware.
 *
 * Example: router.delete('/listing/:id', protect, authorize('platform_admin'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
