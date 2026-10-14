const { Op } = require('sequelize');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * registerUser — creates a new user account.
 * POST /api/auth/register
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if a user with this email already exists
    // Sequelize: User.findOne({ where: { email } })
    // SQL equivalent: SELECT * FROM users WHERE email = ? LIMIT 1
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // Create the user — password is auto-hashed by the beforeCreate hook
    const user = await User.create({ name, email, password });

    // Generate a JWT access token
    const accessToken = generateToken(user.id, 'access');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
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
    // Handle Sequelize validation errors (e.g. invalid email format)
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
 * loginUser — authenticates a user and returns a JWT.
 * POST /api/auth/login
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Use the 'withPassword' scope to include the password column.
    // By default the User model excludes the password field for security.
    const user = await User.scope('withPassword').findOne({ where: { email } });

    // If no user found or password doesn't match, return the same generic error
    // (don't reveal which one failed — security best practice)
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const accessToken = generateToken(user.id, 'access');

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
 * getMe — returns the authenticated user's profile.
 * GET /api/auth/me
 * (Requires auth middleware to attach req.user)
 */
const getMe = async (req, res, next) => {
  try {
    // req.user.id is set by the protect middleware
    // Sequelize: User.findByPk(id) — "findByPrimaryKey"
    // SQL: SELECT * FROM users WHERE id = ? LIMIT 1
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

module.exports = { registerUser, loginUser, getMe };
