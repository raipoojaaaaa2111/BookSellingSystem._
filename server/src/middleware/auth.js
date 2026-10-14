const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — middleware that verifies a JWT and attaches the user to req.user.
 * If the token is invalid or missing, it rejects the request.
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract the token from "Bearer <token>"
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token was found, reject the request
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  try {
    // Verify the token using the access secret
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Attach the user to the request object (without the password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

/**
 * authorize — middleware that checks if the user has one of the allowed roles.
 * Use this after the protect middleware.
 *
 * Example: router.get('/admin', protect, authorize('platform_admin'), handler)
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
