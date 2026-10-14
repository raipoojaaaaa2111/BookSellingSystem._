const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

/**
 * User — Sequelize model representing the `users` table in MySQL.
 *
 * Each property here maps to a column in the table.
 * Sequelize automatically adds `id` (auto-increment primary key),
 * `createdAt`, and `updatedAt` columns.
 */
class User extends Model {
  /**
   * matchPassword — instance method to compare a plain-text password
   * with the hashed one stored in the database.
   * Used during login.
   */
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

User.init(
  {
    // Sequelize adds `id` (INT AUTO_INCREMENT PRIMARY KEY) automatically
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name is required' },
        len: { args: [1, 100], msg: 'Name must be between 1 and 100 characters' },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,   // Creates a UNIQUE index on this column in MySQL
      validate: {
        isEmail: { msg: 'Please enter a valid email address' },
        notEmpty: { msg: 'Email is required' },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: { args: [8, 255], msg: 'Password must be at least 8 characters' },
      },
    },
    collegeId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Optional until colleges table is set up
    },
    profilePhoto: {
      type: DataTypes.STRING(500), // URL to the image (S3 or local)
      allowNull: true,
      defaultValue: null,
    },
    bio: {
      type: DataTypes.STRING(300),
      allowNull: true,
      defaultValue: '',
      validate: {
        len: { args: [0, 300], msg: 'Bio cannot exceed 300 characters' },
      },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Email verification flag
    },
    role: {
      type: DataTypes.ENUM('student', 'college_coordinator', 'platform_admin'),
      defaultValue: 'student',
    },
  },
  {
    sequelize,          // Pass the shared Sequelize instance
    modelName: 'User',  // Sequelize will use the table name "Users" (auto-pluralized)
    tableName: 'users', // Explicitly set to lowercase "users"
    timestamps: true,   // Adds createdAt and updatedAt columns automatically

    // Don't return the password field in query results by default.
    // To include it (e.g. at login), use: User.findOne({ attributes: { include: ['password'] } })
    defaultScope: {
      attributes: { exclude: ['password'] },
    },

    // A named scope that includes the password — used only in authController login
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
    },
  }
);

/**
 * beforeCreate hook — runs automatically BEFORE inserting a new user row.
 * Hashes the plain-text password before saving it.
 */
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

/**
 * beforeUpdate hook — runs BEFORE an UPDATE query on a user row.
 * Only re-hashes if the password field was actually changed.
 */
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

module.exports = User;
