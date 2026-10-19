const express = require('express');
const {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  closeListingStatus,
  getMyListings,
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');
const { validate, listingRules } = require('../middleware/validate');

const router = express.Router();

/**
 * Route map:
 *
 * GET    /api/listings          → browse all active listings (public)
 * POST   /api/listings          → create a listing (protected)
 * GET    /api/listings/my       → my own listings (protected)
 * GET    /api/listings/:id      → single listing detail (public)
 * PUT    /api/listings/:id      → update a listing (protected, owner only)
 * DELETE /api/listings/:id      → delete a listing (protected, owner only)
 * PATCH  /api/listings/:id/status → close a listing (protected, owner only)
 */

// IMPORTANT: /my must come BEFORE /:id
// If /:id is first, Express will match /my as an id and look for listing with id="my"
router.get('/my', protect, getMyListings);

router.get('/', getListings);
router.post('/', protect, listingRules, validate, createListing);

router.get('/:id', getListingById);
router.put('/:id', protect, listingRules, validate, updateListing);
router.delete('/:id', protect, deleteListing);
router.patch('/:id/status', protect, closeListingStatus);

module.exports = router;
