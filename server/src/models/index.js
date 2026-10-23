const User = require('./User');
const Listing = require('./Listing');
const Watchlist = require('./Watchlist');

/**
 * Associations — all model relationships in one place.
 *
 * ── User ↔ Listing (one-to-many) ─────────────────────────────────────
 * One user can have many listings.
 * Each listing belongs to one user.
 */
User.hasMany(Listing, {
  foreignKey: 'userId',
  as: 'listings',
  onDelete: 'CASCADE',
});
Listing.belongsTo(User, {
  foreignKey: 'userId',
  as: 'seller',
});

/**
 * ── User ↔ Listing via Watchlist (many-to-many) ──────────────────────
 * A user can save many listings (watchlist).
 * A listing can be saved by many users.
 *
 * belongsToMany automatically creates the join using the Watchlist table.
 * It gives us:
 *   user.getSavedListings()
 *   listing.getSavedByUsers()
 */
User.belongsToMany(Listing, {
  through: Watchlist,     // the join table
  foreignKey: 'userId',
  otherKey: 'listingId',
  as: 'savedListings',
});
Listing.belongsToMany(User, {
  through: Watchlist,
  foreignKey: 'listingId',
  otherKey: 'userId',
  as: 'savedByUsers',
});

// Direct associations for Watchlist model
User.hasMany(Watchlist, { foreignKey: 'userId', onDelete: 'CASCADE' });
Watchlist.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

module.exports = { User, Listing, Watchlist };
