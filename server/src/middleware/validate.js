const { body, validationResult } = require('express-validator');

/**
 * validate — runs after express-validator checks and returns
 * all validation errors at once as a 400 response.
 *
 * How it works:
 *   router.post('/register', registerRules, validate, registerUser)
 *                              ↑              ↑         ↑
 *                         check rules    collect     controller
 *                                         errors
 *
 * If there are errors, validate() returns early with a 400.
 * The controller (registerUser) never runs.
 * If no errors, it calls next() and the controller runs normally.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Return ALL validation errors at once so the user can fix everything
    // in one go instead of submitting again for each error
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,   // which field failed (e.g. "email")
        message: err.msg,  // the error message (e.g. "Invalid email")
      })),
    });
  }

  next(); // No errors — proceed to the controller
};

// ─── Validation Rule Sets ────────────────────────────────────────────────────
// These are arrays of middleware. Each array is used on a specific route.

/**
 * registerRules — validation for POST /api/auth/register
 */
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(), // converts to lowercase, removes dots in gmail etc.

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

/**
 * loginRules — validation for POST /api/auth/login
 * Lighter than registerRules — we just check they're not empty
 * and let the controller handle "wrong password" logic
 */
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

module.exports = { validate, registerRules, loginRules };
