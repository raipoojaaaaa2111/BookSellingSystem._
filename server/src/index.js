const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────
// helmet adds important HTTP security headers (e.g. prevents clickjacking)
app.use(helmet());

// cors allows requests from the React frontend (different port = different "origin")
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// ─── Logging Middleware ─────────────────────────────────────────────────────
// morgan logs every request to the console: method, path, status, response time
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Body Parser Middleware ─────────────────────────────────────────────────
// Allows Express to read JSON from request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── API Routes ─────────────────────────────────────────────────────────────
// Health check route — hit this to confirm the server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Auth routes: /api/auth/register, /api/auth/login, /api/auth/me
app.use('/api/auth', authRoutes);

// ─── Global Error Handler ───────────────────────────────────────────────────
// Must be after all routes — catches errors from next(error) calls
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
