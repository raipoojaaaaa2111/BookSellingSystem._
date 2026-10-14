const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes — no token required
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route — requires a valid JWT
router.get('/me', protect, getMe);

module.exports = router;
