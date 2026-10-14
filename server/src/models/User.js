const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * UserSchema — defines the structure of a User document in MongoDB.
 * Think of this as creating a table structure in SQL, but more flexible.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return the password by default when querying users
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      // Will be required once colleges are set up
    },
    profilePhoto: {
      type: String, // URL to the image stored in S3 (or local for now)
      default: null,
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false, // Email verification flag
    },
    role: {
      type: String,
      enum: ['student', 'college_coordinator', 'platform_admin'],
      default: 'student',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * Pre-save middleware — runs BEFORE a user document is saved to the database.
 * We use this to hash the password automatically if it's been modified.
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it's been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  // Generate a salt (random string) and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * matchPassword — instance method to compare a plain-text password with the hashed one.
 * We'll use this during login.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
