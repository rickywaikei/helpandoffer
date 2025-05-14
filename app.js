/**
 * Help and Offer Platform - Main Application Entry Point
 *
 * This file initializes the Express application, configures middleware,
 * sets up database connections, and defines routes for the Help and Offer platform.
 *
 * The application allows users to post help requests, offer assistance,
 * and connect with others in their community.
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Express - Web application framework for Node.js
// Provides robust set of features for web and mobile applications
import express from 'express';

// Handlebars - Template engine for rendering dynamic HTML content
// Used for server-side rendering of views with data from the backend
import { create } from 'express-handlebars';

// Mongoose - MongoDB object modeling tool
// Provides schema-based solution to model application data
import mongoose from "mongoose";

// Middleware Components
// -------------------

// Connect-flash - Store temporary messages in session to be displayed to the user
// Used for success/error notifications across redirects
import flash from "connect-flash";

// Express-session - Session middleware for Express
// Manages user sessions and stores session data
import session from "express-session";

// Body-parser - Parse HTTP request bodies
// Extracts data from request body and makes it available on req.body
import bodyParser from "body-parser";

// Morgan - HTTP request logger
// Logs HTTP requests for debugging and monitoring
import morgan from "morgan";

// Method-override - Use HTTP verbs like PUT or DELETE in places where the client doesn't support it
// Allows forms to use PUT/DELETE by overriding with POST and a hidden input
import methodOverride from "method-override";

// CSRF - Cross-Site Request Forgery protection
// Prevents CSRF attacks by requiring a token in non-GET requests
import crypto from 'crypto';

// Passport - Authentication middleware for Node.js
// Handles user authentication with various strategies (local, OAuth, etc.)
import passport from "passport";

// Import routes for different sections of the application
// These define the API endpoints and their handlers
import defaultRoute from "./routes/default.Route.js";
import helpcasesRoute from "./routes/helpcases.Route.js";
import usersRoute from "./routes/usersRoute.js";
import languageRoute from "./routes/language.Route.js";

// Import i18n configuration for multi-language support
import i18n from "./config/i18n.js";

// Cookie parser for reading cookies
import cookieParser from "cookie-parser";

// Helper functions for authentication, time formatting, and validation
import {
  passportConfig,       // Configures passport authentication strategies
  ensureAuthenticated,  // Middleware to protect routes requiring authentication
  getTimestamp,         // Formats dates for display
  getLogTime,           // Adds timestamps to logs
  validatePhoneNumber   // Validates phone numbers (supports Hong Kong format)
} from "./helpers/helper.js";

// Configuration settings from JSON file
// Contains environment-specific settings that can be changed without code modification
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and parse the config.json file
const configPath = path.join(__dirname, 'config.json');
const configData = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configData);

// Initialize passport with our configuration
passportConfig(passport);

// Initialize Express application
const app = express();

/**
 * Configure Handlebars template engine with custom helpers
 * These helpers provide additional functionality in templates
 */
const hbs = create({
  helpers: {
      // Format current timestamp for display
      stringTime() {
        return getTimestamp();
      },

      // Validate phone number format (supports Hong Kong format)
      isPhonenbr() {
        return validatePhoneNumber();
      },

      // Pagination helper functions
      // -------------------------------

      // Check if two values are equal (with type conversion)
      if_eq(a, b) {
        // Convert both values to numbers for comparison
        // This ensures "10" === 10 returns true
        return parseInt(a) === parseInt(b);
      },

      // Alternative equality check for subexpressions
      eq(a, b) {
        // Convert both values to numbers for comparison
        return parseInt(a) === parseInt(b);
      },

      // Check if current page matches a specific page number
      if_current_page(currentPage, pageNum) {
        return parseInt(currentPage) === parseInt(pageNum);
      },

      // Check if a value is an ellipsis (used in pagination)
      if_ellipsis(value) {
        return value === '...';
      },

      // Get the type of a value (for debugging)
      typeof(value) {
        return typeof value;
      },

      // Check if two values are equal (for language selection)
      if_eq(a, b) {
        return a === b;
      },

      // Translation helper for i18n
      t(key, options) {
        // Get the request from the options hash
        const req = options.data.root.req;

        // If req is available, use its translation function
        if (req && typeof req.__ === 'function') {
          return req.__(key);
        }

        // Fallback to global i18n function
        if (typeof i18n.__ === 'function') {
          return i18n.__(key);
        }

        // Last resort fallback
        return key;
      },

      // Alias for t helper to support both naming conventions
      __(key, options) {
        // Get the request from the options hash
        const req = options.data.root.req;

        // If req is available, use its translation function
        if (req && typeof req.__ === 'function') {
          return req.__(key);
        }

        // Fallback to global i18n function
        if (typeof i18n.__ === 'function') {
          return i18n.__(key);
        }

        // Last resort fallback
        return key;
      }
  }
});

// Set up Handlebars as the view engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views'); // Directory containing view templates

/**
 * Database Connection Setup
 * Connect to MongoDB using Mongoose
 */
// Set strictQuery to suppress the deprecation warning
mongoose.set('strictQuery', false);

const mongoURI = process.env.MONGO_URI || config.db.mongoURI;
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log("MongoDB connection error:", err));

/**
 * Middleware Configuration
 * Set up middleware components in the correct order
 */

// HTTP request logger for development
app.use(morgan("tiny")); // Logs requests in format: GET / 404 123ms

// Serve static files from the public directory
app.use(express.static('views/public')); // CSS, JavaScript, images, etc.
app.use(express.static('public')); // Additional public assets

// Parse request bodies
app.use(bodyParser.urlencoded({extended: false})); // Form submissions
app.use(bodyParser.json()); // JSON API requests

// Parse cookies
app.use(cookieParser());

// Initialize i18n middleware for multi-language support
app.use((req, res, next) => {
  // Check for locale in cookie first
  const cookieLocale = req.cookies && req.cookies.locale;
  if (cookieLocale) {
    console.log(`Setting locale from cookie: ${cookieLocale}`);
    i18n.setLocale(req, cookieLocale);
  }
  // Then check if locale is set in the session
  else if (req.session && req.session.locale) {
    console.log(`Setting locale from session: ${req.session.locale}`);
    i18n.setLocale(req, req.session.locale);
  }
  // Initialize i18n
  i18n.init(req, res, next);
});

// Make i18n available to the app
app.set('i18n', i18n);

// Support for HTTP methods that clients don't support natively
app.use(methodOverride("_method")); // Allows forms to use PUT/DELETE

/**
 * Session Configuration
 * Must be configured before passport
 */
app.use(
  session({
    // Secret used to sign the session ID cookie
    secret: process.env.SESSION_SECRET || "temp_fallback_secret_replace_in_production",

    // Forces the session to be saved back to the session store
    resave: true,

    // Forces a session that is "uninitialized" to be saved to the store
    saveUninitialized: true,

    // Cookie settings
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds
      httpOnly: true,                   // Prevents client-side JS from reading the cookie
      secure: false,                    // Set to true in production with HTTPS
      sameSite: 'lax',                  // Controls when cookies are sent with cross-site requests
      path: '/'                         // Make cookie available for the entire site
    },

    // Reset expiration countdown on every response
    rolling: true,

    // Custom name to avoid conflicts with other applications
    name: 'helpandoffer.sid'
  })
);

/**
 * Authentication Setup
 */
// Initialize Passport authentication
app.use(passport.initialize());

// Persistent login sessions
app.use(passport.session());

/**
 * Security Configuration
 */
// Simple CSRF protection middleware
app.use((req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests and avatar upload
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS' ||
      req.path === '/users/myprofile/upload-avatar') {
    return next();
  }

  // Generate CSRF token function
  req.csrfToken = function() {
    if (!req.session.csrfToken) {
      req.session.csrfToken = crypto.randomBytes(20).toString('hex');
    }
    return req.session.csrfToken;
  };

  // Verify CSRF token
  const token = req.body._csrf || req.query._csrf;
  if (!token || token !== req.session.csrfToken) {
    console.log('CSRF token validation failed');
    console.log('Token received:', token);
    console.log('Token expected:', req.session.csrfToken);
    return res.status(403).render('500', {
      error: 'CSRF token validation failed',
      layout: 'error'
    });
  }

  next();
});

/**
 * Flash Messages and Template Variables
 * Make certain data available to all views
 */
app.use(flash());
app.use(function(req, res, next) {
  // Make flash messages available to views
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");

  // Handle passport error messages
  const passportErrors = req.flash("error");
  if (passportErrors && passportErrors.length > 0) {
    res.locals.fail_passport = passportErrors.map(error => {
      return { message: error };
    });
  } else {
    res.locals.fail_passport = [];
  }

  // Make user data available to views if logged in
  res.locals.user = req.user || null;

  // Make CSRF token available to all views for form protection
  // Generate a new CSRF token for each request
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(20).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;

  // Make current language available to all views
  res.locals.currentLanguage = req.getLocale();
  res.locals.availableLanguages = i18n.getLocales();

  // Make the request object available to views for i18n
  res.locals.req = req;

  // Make the translation function directly available to views
  res.locals.__ = function(phrase) {
    return req.__(phrase);
  };

  // Add a shorthand t function for translation
  res.locals.t = function(phrase) {
    return req.__(phrase);
  };

  console.log(`Current language for this request: ${req.getLocale()}`);

  // Continue to next middleware
  next();
});

/**
 * Route Configuration
 * Define application routes and their handlers
 */

// Public routes - accessible without authentication
// ------------------------------------------------

// Main routes for browsing and searching help requests
app.use("/", defaultRoute);

// Language switching route
app.use("/language", languageRoute);

// About page
app.get('/about', (req, res) => {
    res.render('about', {
      title: req.__('about.title')
    });
});

// Protected routes - require authentication
// ----------------------------------------

// Help cases management (create, edit, delete help requests)
app.use("/helpcases", ensureAuthenticated, helpcasesRoute);

// User management (profile, settings, etc.)
app.use("/users", usersRoute);

/**
 * Error Handling
 * Custom error pages and handlers
 */

// 404 - Page Not Found
// Catch-all handler for undefined routes
app.use("*", (req, res) => {
  // Set HTTP status code
  res.status(404);

  // Render custom 404 page
  res.render("404", {
    layout: 'main',
    title: req.__('errors.404')
  });
});

// 500 - Server Error
// Global error handler for unhandled exceptions
app.use((err, req, res, next) => {
  // Log the error for debugging
  console.error("Server error:", err.stack);

  // Generate a unique error ID for reference
  const errorId = 'ERR-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5).toUpperCase();

  // Set HTTP status code
  res.status(500);

  // Render custom 500 page
  res.render("500", {
    layout: 'main',
    title: req.__('errors.500'),
    errorId: errorId // Provide error ID for user to reference when reporting issues
  });
});

/**
 * Server Startup
 * Start the Express server on the configured port
 */
const PORT = process.env.PORT || config.app.PORT || "3000";

app.listen(PORT, () => {
    console.log(getLogTime() + `Server started on port ${PORT}`);
    console.log(`Application available at http://localhost:${PORT}`);
});
