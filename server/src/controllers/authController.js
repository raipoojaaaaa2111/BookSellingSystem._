const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * tokenBlacklist — in-memory Set that stores invalidated access tokens.
 *
 * When a user logs out, their token is added here.
 * The protect middleware checks this before allowing any request.
 *
 * NOTE: This resets when the server restarts. In production (Day 8+)
 * we'll move this to Redis so it persists across server restarts
 * and works across multiple server instances (as per the architecture doc).
 */
const tokenBlacklist = new Set();

// Export so the protect middleware can access it
module.exports.tokenBlacklist = tokenBlacklist;

// ─── Helper: send refresh token as httpOnly cookie ───────────────────────────
/**
 * setRefreshCookie — attaches the refresh token to the response as a cookie.
 *
 * httpOnly: true  → JavaScript cannot read this cookie (XSS protection)
 * secure: true    → only sent over HTTPS (in production)
 * sameSite: strict → only sent to our own domain (CSRF protection)
 * maxAge          → 7 days in milliseconds
 */
const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * registerUser — creates a new user account.
 * POST /api/auth/register
 *
 * Flow:
 * 1. Check email not already taken
 * 2. Create user (password auto-hashed by Sequelize beforeCreate hook)
 * 3. Generate access token (15 min) + refresh token (7 days)
 * 4. Send refresh token as httpOnly cookie
 * 5. Send access token + user data in response body
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create user — beforeCreate hook hashes the password automatically
    const user = await User.create({ name, email, password });

    // Generate both tokens
    const accessToken = generateToken(user.id, 'access');
    const refreshToken = generateToken(user.id, 'refresh');

    // Attach refresh token as a secure httpOnly cookie
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token: accessToken, // Short-lived access token for immediate use
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors.map((e) => e.message).join(', '),
      });
    }
    next(error);
  }
};

/**
 * loginUser — authenticates a user and returns tokens.
 * POST /api/auth/login
 *
 * Flow:
 * 1. Find user by email (using withPassword scope to include hashed password)
 * 2. Compare entered password with hashed one
 * 3. Generate access + refresh tokens
 * 4. Send refresh token as cookie, access token in body
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // withPassword scope includes the password column that is excluded by default
    const user = await User.scope('withPassword').findOne({ where: { email } });

    // Always return the same error whether email or password is wrong
    // (don't reveal which one failed — prevents user enumeration attacks)
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const accessToken = generateToken(user.id, 'access');
    const refreshToken = generateToken(user.id, 'refresh');

    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * logoutUser — invalidates the current session.
 * POST /api/auth/logout  (protected route)
 *
 * Flow:
 * 1. Add the current access token to the blacklist
 * 2. Clear the refresh token cookie
 * 3. User is fully logged out — their token is dead even before expiry
 */
const logoutUser = async (req, res, next) => {
  try {
    // Get the raw token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      // Add to blacklist — this token will be rejected by protect middleware
      tokenBlacklist.add(token);
    }

    // Clear the refresh token cookie by setting it with maxAge = 0
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Immediately expire the cookie
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * refreshToken — issues a new access token using the refresh token cookie.
 * POST /api/auth/refresh  (public route — no access token needed)
 *
 * Flow:
 * 1. Read refresh token from the httpOnly cookie
 * 2. Verify it with the refresh secret
 * 3. Check the user still exists in the DB
 * 4. Issue a fresh access token (15 min)
 *
 * This runs automatically from the frontend when a 401 is received.
 * The user never sees it happen.
 */
const refreshToken = async (req, res, next) => {
  try {
    // Read from cookie (set during login/register)
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token found, please log in again',
      });
    }

    // Verify the refresh token using the REFRESH secret (different from access secret)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired or invalid, please log in again',
      });
    }

    // Make sure the user still exists (e.g. account wasn't deleted)
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    // Issue a fresh access token
    const newAccessToken = generateToken(user.id, 'access');

    res.status(200).json({
      success: true,
      token: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * getMe — returns the authenticated user's profile.
 * GET /api/auth/me  (protected route)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, logoutUser, refreshToken, getMe };
