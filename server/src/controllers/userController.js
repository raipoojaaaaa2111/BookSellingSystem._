const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * updateProfile — PATCH /api/users/profile
 * Protected: must be logged in
 *
 * Lets the user update their name, bio, and profile photo.
 * Email is intentionally excluded here — changing email needs
 * re-verification (we'll add that later).
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, profilePhoto } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only update fields that were actually sent in the request
    // ?? means "use left side if it's not null/undefined, else use right side"
    await user.update({
      name:         name         ?? user.name,
      bio:          bio          ?? user.bio,
      profilePhoto: profilePhoto ?? user.profilePhoto,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id:           user.id,
        name:         user.name,
        email:        user.email,
        bio:          user.bio,
        profilePhoto: user.profilePhoto,
        role:         user.role,
        isVerified:   user.isVerified,
      },
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
 * changePassword — PATCH /api/users/password
 * Protected: must be logged in
 *
 * Requires the current password for verification before allowing change.
 * The beforeUpdate hook in User.js automatically hashes the new password.
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters',
      });
    }

    // Need withPassword scope to get the hashed password for comparison
    const user = await User.scope('withPassword').findByPk(req.user.id);

    // Verify current password is correct before allowing change
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // beforeUpdate hook in User.js will hash this automatically
    await user.update({ password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * getUserProfile — GET /api/users/:id
 * Public: anyone can view a user's public profile
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'bio', 'profilePhoto', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, changePassword, getUserProfile };
