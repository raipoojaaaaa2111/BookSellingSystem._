const { Watchlist, Listing, User } = require('../models/index');

const SELLER_ATTRIBUTES = ['id', 'name', 'profilePhoto'];

/**
 * saveToWatchlist — POST /api/watchlist/:listingId
 * Saves a listing to the logged-in user's watchlist.
 * If already saved, returns a friendly message instead of an error.
 */
const saveToWatchlist = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    // Make sure the listing actually exists
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // findOrCreate — either finds existing row or creates a new one
    // returns [instance, wasCreated] — wasCreated is true if it was new
    const [watchlistItem, wasCreated] = await Watchlist.findOrCreate({
      where: { userId: req.user.id, listingId },
    });

    if (!wasCreated) {
      return res.status(200).json({
        success: true,
        message: 'Already saved to watchlist',
        saved: true,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Saved to watchlist',
      saved: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * removeFromWatchlist — DELETE /api/watchlist/:listingId
 * Removes a listing from the logged-in user's watchlist.
 */
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    // destroy() with where clause = DELETE FROM watchlists WHERE userId=? AND listingId=?
    const deleted = await Watchlist.destroy({
      where: { userId: req.user.id, listingId },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'This listing is not in your watchlist',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Removed from watchlist',
      saved: false,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * getWatchlist — GET /api/watchlist
 * Returns all listings saved by the logged-in user.
 * Includes full listing details + seller name via JOIN.
 */
const getWatchlist = async (req, res, next) => {
  try {
    const watchlistItems = await Watchlist.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Listing,
          as: 'listing',
          // Only include active listings in watchlist
          where: { status: 'active' },
          required: false, // LEFT JOIN — include even if listing was deleted/closed
          include: [
            { model: User, as: 'seller', attributes: SELLER_ATTRIBUTES },
          ],
        },
      ],
      order: [['createdAt', 'DESC']], // Most recently saved first
    });

    // Extract just the listing objects from watchlist rows
    const listings = watchlistItems
      .map((item) => item.listing)
      .filter(Boolean); // remove nulls (deleted listings)

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * checkWatchlistStatus — GET /api/watchlist/check/:listingId
 * Returns whether the logged-in user has saved a specific listing.
 * Used to show the heart icon as filled or empty on the detail page.
 */
const checkWatchlistStatus = async (req, res, next) => {
  try {
    const item = await Watchlist.findOne({
      where: { userId: req.user.id, listingId: req.params.listingId },
    });

    res.status(200).json({ success: true, saved: !!item }); // !! converts to boolean
  } catch (error) {
    next(error);
  }
};

module.exports = { saveToWatchlist, removeFromWatchlist, getWatchlist, checkWatchlistStatus };
