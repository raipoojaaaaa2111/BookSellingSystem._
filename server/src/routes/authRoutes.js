const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, registerRules, loginRules } = require('../middleware/validate');

const router = express.Router();

/**
 * Route breakdown:
 *
 * POST /api/auth/register
 *   → registerRules  (check name, email, password format)
 *   → validate       (return 400 if any rules failed)
 *   → registerUser   (controller: create user, return token)
 *
 * POST /api/auth/login
 *   → loginRules     (check email + password not empty)
 *   → validate       (return 400 if any rules failed)
 *   → loginUser      (controller: verify password, return token)
 *
 * POST /api/auth/logout
 *   → protect        (must be logged in to log out)
 *   → logoutUser     (blacklist token, clear cookie)
 *
 * POST /api/auth/refresh
 *   → refreshToken   (reads httpOnly cookie, returns new access token)
 *
 * GET /api/auth/me
 *   → protect        (verify token)
 *   → getMe          (return user profile)
 */

// Public routes
router.post('/register', registerRules, validate, registerUser);
router.post('/login', loginRules, validate, loginUser);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);

module.exports = router;
