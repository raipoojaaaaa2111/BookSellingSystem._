const express = require('express');
const { updateProfile, changePassword, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * GET  /api/users/:id          → public profile (anyone can view)
 * PATCH /api/users/profile     → update my profile (protected)
 * PATCH /api/users/password    → change my password (protected)
 *
 * NOTE: /profile and /password must come BEFORE /:id
 * otherwise Express treats "profile" as an id param
 */
router.get('/:id', getUserProfile);
router.patch('/profile', protect, updateProfile);
router.patch('/password', protect, changePassword);

module.exports = router;
