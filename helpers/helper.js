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
            message: "errors.userNotFound",
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
              message: "errors.incorrectPassword",
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
    req.__('errors.loginRequired')
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
 * Validates phone numbers with flexible format support.
 * Supports formats like:
 * - +1 123-4567
 * - +44 1234-5678
 * - +852 9876-4321
 * - 98765432 (no country code)
 * - 123-4567 (no country code)
 * - 1234-5678 (no country code)
 *
 * @param {string} input_str - Phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validatePhoneNumber = (input_str) => {
  // If input is empty, consider it valid (since phone is optional)
  if (!input_str) return true;

  // Remove all spaces for normalization
  const normalizedInput = input_str.replace(/\s+/g, '');

  // Case 1: Phone with country code (+1, +44, +852, etc.)
  // Format: +[1-3 digits] [3-4 digits]-[3-4 digits] or without dash
  const countryCodeRegex = /^\+\d{1,3}[-]?\d{3,4}[-]?\d{3,4}$/;
  if (countryCodeRegex.test(normalizedInput)) {
    return true;
  }

  // Case 2: Phone without country code
  // Format: [3-4 digits]-[3-4 digits] or without dash
  const localPhoneRegex = /^\d{3,4}[-]?\d{3,4}$/;
  if (localPhoneRegex.test(normalizedInput)) {
    return true;
  }

  // Case 3: Simple digit sequence (7-8 digits) without formatting
  const simpleDigitsRegex = /^\d{7,8}$/;
  if (simpleDigitsRegex.test(normalizedInput)) {
    return true;
  }

  // If none of the patterns match, the phone number is invalid
  return false;
};