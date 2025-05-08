/**
 * Help Cases Routes
 *
 * This module defines all routes related to help case management, including:
 * - Creating, editing, and deleting help requests
 * - Offering help on existing requests
 * - Managing offers (update, remove)
 * - Viewing records and statistics
 * - Badge management for completed help cases
 *
 * All routes in this module require authentication.
 */

import express from "express";

// Import controller functions for help case management
import {
  // Help case management
  getAddHelpcase,    // Display form to add new help case
  postAddHelpcase,   // Process new help case submission
  getHelpcases,      // List all help cases
  deleteHelpcase,    // Delete a help case
  getEditHelpcase,   // Display form to edit help case
  putEditHelpcase,   // Process help case edit
  getRecords,        // View help case records/history

  // Offer management
  getOffercases,     // List cases where user has offered help
  getAddoffer,       // Display form to add offer
  putAddoffer,       // Process new offer
  getUpdateoffer,    // Display form to update offer
  putUpdateoffer,    // Process offer update
  getRemoveoffer,    // Display form to remove offer
  putRemoveoffer,    // Process offer removal

  // Badge management
  putGiveBadge,      // Award badge for completed help
} from "../controllers/helpcaseController.js";

// Create router instance
const router = express.Router();

// Help case management routes
// --------------------------

// Main help cases page and submission endpoint
router.get("/", getHelpcases)         // List all help cases
      .post("/", postAddHelpcase);    // Submit new help case (alternative to /add)

// Add new help case form
router.get("/add", getAddHelpcase);

// Edit help case
router.get("/edit/(:id)", getEditHelpcase)    // Display edit form
      .put("/edit/(:id)", putEditHelpcase);   // Process edit submission

// Delete help case
router.delete("/(:id)", deleteHelpcase);

// View help case records/history
router.get("/records", getRecords);

// Offer management routes
// ----------------------

// View cases where user has offered help
router.get("/offered", getOffercases);

// Add offer to help case
router.get("/addoffer/(:id)", getAddoffer)    // Display add offer form
      .put("/addoffer/(:id)", putAddoffer);   // Process offer submission

// Update existing offer
router.get("/update/(:id)", getUpdateoffer)   // Display update form
      .put("/update/(:id)", putUpdateoffer);  // Process update submission

// Remove existing offer
router.get("/remove/(:id)", getRemoveoffer)   // Display remove confirmation
      .put("/remove/(:id)", putRemoveoffer);  // Process removal

// Badge management
// ---------------

// Award badge for completed help
router.put("/givebadge/(:offer)", putGiveBadge);

export default router;
