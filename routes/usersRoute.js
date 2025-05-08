/**
 * User Routes
 *
 * This module defines all routes related to user management, including:
 * - Authentication (register, login, logout)
 * - Profile management (view, edit, update)
 * - User administration (list users, edit users, delete users)
 * - Badge management
 *
 * Some routes are protected and require authentication.
 */

import express from "express";

// Import controller functions for user management
import {
  // Authentication
  getRegister,         // Display registration form
  postRegister,        // Process registration
  getLogin,            // Display login form
  postLogin,           // Process login
  getLogout,           // Process logout

  // Profile management
  getMyprofile,        // Display user's profile
  putUpdateMyprofile,  // Update profile

  // User administration
  getProfiles,         // List all users
  deleteUser,          // Delete a user
  postAddBadge,        // Add badge to user
  getEditUser,         // Display edit user form
  postEditUser,        // Process user edit
} from "../controllers/userController.js";

// Import authentication middleware
import { ensureAuthenticated } from "../helpers/helper.js";

// Create router instance
const router = express.Router();

// Authentication routes (public)
// ---------------------------

// Registration - create new user account
router.route("/register")
  .get(getRegister)    // Display registration form
  .post(postRegister); // Process registration submission

// Login - authenticate user
router.route("/login")
  .get(getLogin)       // Display login form
  .post(postLogin);    // Process login submission

// Logout - end user session
// Supports both GET (link) and POST (form) for compatibility
router.route("/logout")
  .get(getLogout)      // Handle logout link
  .post(getLogout);    // Handle logout form submission

// Profile management routes (protected)
// ------------------------------------

// User profile - view and edit personal information
router.get("/myprofile", ensureAuthenticated, getMyprofile);

// Avatar management
// Import avatar controller functions
import {
  handleAvatarUpload,  // Handle avatar upload
  handleAvatarDelete   // Remove avatar
} from "../controllers/avatarController.js";

// Special route for avatar uploads (no CSRF required)
router.post("/myprofile/upload-avatar", ensureAuthenticated, handleAvatarUpload);
router.post("/myprofile/delete-avatar", ensureAuthenticated, handleAvatarDelete);

// Profile updates - endpoint for updating user profile information
router.post("/update", ensureAuthenticated, putUpdateMyprofile);

// User administration routes (protected)
// -------------------------------------

// List all users
router.get("/profiles", ensureAuthenticated, getProfiles);

// Delete user by ID
router.delete("/(:id)", ensureAuthenticated, deleteUser);

// Add badge to user
router.post("/addbadge/(:id)", ensureAuthenticated, postAddBadge);

// Edit user by ID
router.route("/edit/(:id)")
  .get(ensureAuthenticated, getEditUser)   // Display edit form
  .put(ensureAuthenticated, postEditUser); // Process edit submission

export default router;