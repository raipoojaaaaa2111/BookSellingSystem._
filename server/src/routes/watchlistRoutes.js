const express = require('express');
const {
  saveToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  checkWatchlistStatus,
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All watchlist routes are protected — must be logged in
router.get('/',                    protect, getWatchlist);
router.get('/check/:listingId',    protect, checkWatchlistStatus);
router.post('/:listingId',         protect, saveToWatchlist);
router.delete('/:listingId',       protect, removeFromWatchlist);

module.exports = router;
