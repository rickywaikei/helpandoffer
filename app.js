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
import csrf from 'csurf';

// Passport - Authentication middleware for Node.js
// Handles user authentication with various strategies (local, OAuth, etc.)
import passport from "passport";

// Import routes for different sections of the application
// These define the API endpoints and their handlers
import defaultRoute from "./routes/default.Route.js";
import helpcasesRoute from "./routes/helpcases.Route.js";
import usersRoute from "./routes/usersRoute.js";

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
import config from "./config.json" assert {type: 'json'};

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

// Parse request bodies
app.use(bodyParser.urlencoded({extended: false})); // Form submissions
app.use(bodyParser.json()); // JSON API requests

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
      sameSite: 'lax'                   // Controls when cookies are sent with cross-site requests
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
// CSRF protection middleware
const csrfProtection = csrf({
  cookie: false,  // Use session instead of cookies
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'] // Only apply CSRF protection to state-changing methods
});

// Apply CSRF protection to all routes except file uploads
app.use((req, res, next) => {
  // Skip CSRF for avatar upload
  if (req.path === '/users/myprofile/upload-avatar') {
    return next();
  }
  // Apply CSRF protection to all other routes
  csrfProtection(req, res, next);
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
  res.locals.fail_passport = req.flash("fail_passport");

  // Make user data available to views if logged in
  res.locals.user = req.user || null;

  // Make CSRF token available to all views for form protection
  // Only add CSRF token if the route has CSRF protection
  if (req.csrfToken && typeof req.csrfToken === 'function') {
    res.locals.csrfToken = req.csrfToken();
  }

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

// About page
app.get('/about', (req, res) => {
    res.render('about', {
      title: 'About Us'
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
    title: '404 - Page Not Found'
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
    title: '500 - Server Error',
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
