/**
 * Default Routes
 *
 * This module defines the public routes for the application,
 * including the home page, search page, and contact form.
 *
 * These routes are accessible without authentication.
 */

import express from "express";

// Import controller functions
import {
  getAllcases,      // Handles displaying all help cases with pagination and search
  searchHelpCases,  // Dedicated search page for help cases
  postSendMsg,      // Processes contact form submissions
} from "../controllers/defaultController.js";

// Create router instance
const router = express.Router();

// Define routes
// -------------

// Home page - displays all help cases with pagination and search
router.get("/", getAllcases);

// Search page - dedicated page for searching help cases without login
router.get("/search", searchHelpCases);

// Contact form submission
router.post("/sendmsg", postSendMsg);

export default router;
