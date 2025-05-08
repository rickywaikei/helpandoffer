/**
 * Helper Functions Module
 *
 * This module provides utility functions for authentication, validation,
 * and formatting throughout the application.
 */

// Passport authentication strategy
import { Strategy as LocalStrategy } from "passport-local";

// Password hashing library
import bcrypt from "bcryptjs";

// User model for database operations
import User from "../models/User.js";

// Application configuration
import config from "../config.json" assert { type: "json" };

/**
 * Configure Passport Authentication
 *
 * Sets up the local authentication strategy and session serialization/deserialization.
 *
 * @param {Object} passport - The passport instance to configure
 */
export const passportConfig = (passport) => {
  // Configure the local strategy for username/password authentication
  passport.use(
    new LocalStrategy({
      // Map form field names to strategy parameters
      usernameField: "usernameInput",
      passwordField: "passwordInput"
    },
    /**
     * Verify callback for local strategy
     *
     * @param {string} usernameInput - The username submitted by the user
     * @param {string} passwordInput - The password submitted by the user
     * @param {Function} done - Callback to indicate success/failure
     */
    function (usernameInput, passwordInput, done) {
      // Find the user by username
      User.findOne({ name: usernameInput }).then((user) => {
        // If user not found, return error
        if (!user) {
          return done(null, false, {
            type: "fail_passport",
            message: "User not found, please try again!",
          });
        }

        // Compare submitted password with stored hash
        bcrypt.compare(passwordInput, user.password, (err, isMatch) => {
          if (err) throw err;

          // If passwords match, authentication successful
          if (isMatch) {
            return done(null, user);
          } else {
            // If passwords don't match, authentication failed
            return done(null, false, {
              type: "fail_passport",
              message: "Incorrect password!",
            });
          }
        });
      });
    })
  );

  /**
   * Serialize user to the session
   * Determines which data of the user object should be stored in the session
   */
  passport.serializeUser(function (user, done) {
    // Store only the user ID in the session
    done(null, user.id);
  });

  /**
   * Deserialize user from the session
   * Uses the ID from the session to retrieve the full user object
   */
  passport.deserializeUser(function (id, done) {
    // Find user by ID stored in session
    User.findById(id)
      .then(user => {
        if (!user) {
          // If user no longer exists, handle gracefully
          return done(null, false);
        }
        // Return the user object
        return done(null, user);
      })
      .catch(err => {
        // Log and handle any errors
        console.error("Error in deserializeUser:", err);
        return done(err, null);
      });
  });
};

/**
 * Authentication Middleware
 *
 * Ensures that a user is authenticated before accessing protected routes.
 * If not authenticated, redirects to login page with a message.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const ensureAuthenticated = (req, res, next) => {
  // Check if user is authenticated
  if (req.isAuthenticated()) {
    // Log successful authentication check
    console.log(`User ${req.user.name} is authenticated, proceeding to ${req.originalUrl}`);
    return next();
  }

  // If not authenticated, log the failure
  console.log(`Authentication failed for route: ${req.originalUrl}`);

  // Store the original URL to redirect back after login
  req.session.returnTo = req.originalUrl;

  // Flash a message to the user
  req.flash(
    "error_msg",
    "Please log in to access this page"
  );

  // Redirect to login page
  return res.redirect("/users/login");
};

// Get locale setting from configuration
const LOCALE = config.app.LOCALE;

/**
 * Format Timestamp
 *
 * Formats a date object as a localized string based on application settings.
 *
 * @param {Date} current - Date object to format (defaults to current time)
 * @returns {string} Formatted date string
 */
export const getTimestamp = (current) => {
  // Use current time if no date provided
  if (!current) {
    current = new Date();
  }

  // Format date according to locale settings
  return current.toLocaleString(`${LOCALE}`, { hour12: false }).concat(" ");
};

/**
 * Get Formatted Log Time
 *
 * Returns a formatted timestamp for logging if enabled in config,
 * otherwise returns an empty string.
 *
 * @returns {string} Formatted timestamp or empty string
 */
export const getLogTime = () => {
  // Only add timestamps to logs if enabled in config
  if (config.app.logTIME) {
    let current = new Date();
    return current.toLocaleString(`${LOCALE}`, { hour12: false }).concat(" ");
  } else {
    return "";
  }
};

/**
 * Validate Phone Number
 *
 * Validates phone numbers with special support for Hong Kong format.
 * Supports formats like:
 * - +852 9876-4321
 * - 98765432
 * - 85298765432
 *
 * @param {string} input_str - Phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validatePhoneNumber = (input_str) => {
  // If input is empty, consider it valid (since phone is optional)
  if (!input_str) return true;

  // For Hong Kong phone numbers like +852 9876-4321
  // First, try a direct match with a flexible regex for Hong Kong format
  const hkRegex = /^(\+?852)?[ -]?([2-9]\d{3})[ -]?(\d{4})$/;
  if (hkRegex.test(input_str)) {
    return true;
  }

  // If direct match fails, try normalizing and checking
  // Remove all non-digit characters for normalization
  const digitsOnly = input_str.replace(/\D/g, '');

  // Case 1: 8 digits (local format without country code)
  // Hong Kong phone numbers start with 2-9 and are 8 digits long
  if (digitsOnly.length === 8 && /^[2-9]\d{7}$/.test(digitsOnly)) {
    return true;
  }

  // Case 2: 10-11 digits (with 852 country code)
  // Hong Kong country code (852) followed by an 8-digit phone number
  if ((digitsOnly.length === 11 || digitsOnly.length === 10) &&
      digitsOnly.startsWith('852') &&
      /^852[2-9]\d{6,7}$/.test(digitsOnly)) {
    return true;
  }

  // If none of the patterns match, the phone number is invalid
  return false;
};