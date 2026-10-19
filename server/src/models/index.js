const User = require('./User');
const Listing = require('./Listing');

/**
 * Associations — define the relationships between models.
 *
 * This file is the single place where all relationships are declared.
 * Import this file once in index.js and all associations are set up.
 *
 * User ←→ Listing (one-to-many)
 *   One user can have many listings.
 *   Each listing belongs to exactly one user.
 *
 * What this enables:
 *   // Get all listings with their owner's name included (single SQL JOIN)
 *   Listing.findAll({ include: User })
 *
 *   // Get a user with all their listings
 *   User.findOne({ include: Listing })
 *
 *   // Get just the user of a listing
 *   const listing = await Listing.findByPk(1)
 *   const owner = await listing.getUser()
 */

// A User has many Listings
// Adds userId foreign key to the listings table (already defined in Listing model)
User.hasMany(Listing, {
  foreignKey: 'userId',
  as: 'listings',    // lets you do: user.getListings() or include: { model: Listing, as: 'listings' }
  onDelete: 'CASCADE',
});

// A Listing belongs to one User
// Adds getUser() method to Listing instances
Listing.belongsTo(User, {
  foreignKey: 'userId',
  as: 'seller',      // lets you do: listing.getSeller() or include: { model: User, as: 'seller' }
});

module.exports = { User, Listing };
