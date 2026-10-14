const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * registerUser — creates a new user account.
 * POST /api/auth/register
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // Create the user (password will be auto-hashed by the pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate a JWT token
    const accessToken = generateToken(user._id, 'access');

    // Send back the user (without password) and the token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token: accessToken,
    });
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
};

/**
 * loginUser — authenticates a user and returns a JWT.
 * POST /api/auth/login
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find the user and explicitly include the password field
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const accessToken = generateToken(user._id, 'access');

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
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
    // req.user is set by the auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
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
