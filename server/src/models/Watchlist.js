const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Watchlist — a join table between users and listings.
 *
 * When a user "saves" a listing, one row is created here:
 *   userId: 5, listingId: 12
 *
 * When they "unsave" it, that row is deleted.
 *
 * This is a many-to-many relationship:
 *   One user can save many listings
 *   One listing can be saved by many users
 */
class Watchlist extends Model {}

Watchlist.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    listingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'listings', key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'Watchlist',
    tableName: 'watchlists',
    timestamps: true,
    // Prevent duplicate saves — a user can only save a listing once
    indexes: [
      { unique: true, fields: ['userId', 'listingId'] },
    ],
  }
);

module.exports = Watchlist;
