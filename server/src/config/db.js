const { Sequelize } = require('sequelize');

/**
 * sequelize — the single shared Sequelize instance for the whole app.
 *
 * Sequelize is the ORM (Object-Relational Mapper) for MySQL.
 * It translates JavaScript objects and methods into SQL queries so you
 * never have to write raw SQL for everyday operations.
 *
 * We export this instance so every model file can import it and register
 * itself against the same connection pool.
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,     // Database name (e.g. "bookexchange")
  process.env.DB_USER,     // MySQL username (e.g. "root")
  process.env.DB_PASSWORD, // MySQL password
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',      // Tell Sequelize we're using MySQL

    // Connection pool: reuse connections instead of opening a new one per query
    pool: {
      max: 10,    // Maximum 10 simultaneous connections
      min: 0,     // Allow the pool to empty when idle
      acquire: 30000, // Wait up to 30s to get a connection before throwing
      idle: 10000,    // Close a connection after 10s of inactivity
    },

    // Only log SQL queries in development — too noisy for production
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

/**
 * connectDB — tests the connection and syncs all models to the database.
 *
 * sequelize.sync() looks at your model definitions and creates the
 * corresponding MySQL tables if they don't exist yet.
 * { alter: true } updates existing tables to match your models (dev only).
 * In production you'd use migrations instead of sync.
 */
const connectDB = async () => {
  try {
    // authenticate() sends a simple test query to confirm the connection works
    await sequelize.authenticate();
    console.log('MySQL Connected successfully.');

    // sync() creates/updates tables based on your model definitions
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database tables synced.');
  } catch (error) {
    console.error('MySQL connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
