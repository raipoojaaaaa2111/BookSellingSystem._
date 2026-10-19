const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Listing — represents a book posted on the platform.
 *
 * A listing can be tagged as one or more types:
 *   - sale      → user wants money for it (price required)
 *   - exchange  → user wants another book in return
 *   - donation  → user is giving it away free
 *
 * Lifecycle of a listing (status field):
 *   active → sold / exchanged / donated / expired
 *
 * Every listing belongs to a User (userId foreign key).
 * When we set up associations, User.hasMany(Listing) and
 * Listing.belongsTo(User) will let us do things like:
 *   listing.getUser() or user.getListings()
 */
class Listing extends Model {}

Listing.init(
  {
    // ── Book Information ──────────────────────────────────────────────────
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Book title is required' },
      },
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Author is required' },
      },
    },
    isbn: {
      type: DataTypes.STRING(20),
      allowNull: true, // Not all books have ISBNs
    },
    edition: {
      type: DataTypes.STRING(50),
      allowNull: true, // e.g. "3rd Edition"
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: true, // e.g. "Computer Science", "Physics"
    },
    description: {
      type: DataTypes.TEXT, // TEXT = longer than VARCHAR, good for descriptions
      allowNull: true,
    },

    // ── Condition ─────────────────────────────────────────────────────────
    // ENUM = only these exact values are allowed in the column
    condition: {
      type: DataTypes.ENUM('new', 'like_new', 'good', 'fair', 'poor'),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Book condition is required' },
      },
    },

    // ── Transaction Type ──────────────────────────────────────────────────
    // JSON array — a book can be listed as multiple types simultaneously
    // e.g. ["sale", "exchange"] means "buy it or swap for it"
    // Stored as JSON in MySQL, automatically parsed when read
    type: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['sale'],
      validate: {
        isValidType(value) {
          const allowed = ['sale', 'exchange', 'donation'];
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error('At least one listing type is required');
          }
          value.forEach((t) => {
            if (!allowed.includes(t)) {
              throw new Error(`Invalid type: ${t}`);
            }
          });
        },
      },
    },

    // ── Pricing ───────────────────────────────────────────────────────────
    // DECIMAL(10, 2) = up to 10 digits total, 2 after decimal point
    // e.g. 99999999.99 max
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // null for exchange-only or donation listings
      validate: {
        min: { args: [0.01], msg: 'Price must be at least $0.01' },
      },
    },

    // ── Photos ────────────────────────────────────────────────────────────
    // JSON array of image URLs (stored in S3 later, local for now)
    // e.g. ["/uploads/book1.jpg", "/uploads/book2.jpg"]
    photos: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    // ── Status ───────────────────────────────────────────────────────────
    status: {
      type: DataTypes.ENUM('active', 'sold', 'exchanged', 'donated', 'expired'),
      defaultValue: 'active',
    },

    // ── Metadata ──────────────────────────────────────────────────────────
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Incremented every time someone views this listing
    },

    // ── Foreign Key ───────────────────────────────────────────────────────
    // Links this listing to the user who created it
    // References the `id` column in the `users` table
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE', // If user is deleted, delete their listings too
    },
  },
  {
    sequelize,
    modelName: 'Listing',
    tableName: 'listings',
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = Listing;
