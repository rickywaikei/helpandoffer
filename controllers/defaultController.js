/**
 * Default Controller
 *
 * This module handles the public-facing routes of the application,
 * including the home page with pagination and search functionality,
 * and the contact form submission.
 */

import { getLogTime, getTimestamp } from "../helpers/helper.js";
import Helpcase from "../models/Helpcase.js";
import User from "../models/User.js";

/**
 * Generate Pagination Array
 *
 * Creates an array of page numbers to display in pagination controls.
 * Includes the current page, some pages before and after, and ellipses
 * for gaps in the sequence.
 *
 * Example output for page 5 of 10 pages: [1, '...', 3, 4, 5, 6, 7, '...', 10]
 *
 * @param {number} currentPage - The current page number
 * @param {number} totalPages - The total number of pages
 * @returns {Array} Array of page numbers and ellipses
 */
function generatePaginationArray(currentPage, totalPages) {
  // Number of pages to show before and after current page
  const delta = 2;
  const pages = [];

  // Always include first page for navigation
  pages.push(1);

  // Calculate range of pages to show around current page
  const rangeStart = Math.max(2, currentPage - delta);
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

  // Add ellipsis if there's a gap after page 1
  if (rangeStart > 2) {
    pages.push('...');
  }

  // Add pages in the range around current page
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Add ellipsis if there's a gap before the last page
  if (rangeEnd < totalPages - 1) {
    pages.push('...');
  }

  // Always include last page for navigation (if more than one page)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Get All Help Cases
 *
 * Retrieves and displays all help cases with pagination and search functionality.
 * This is the main handler for the home page.
 *
 * Features:
 * - Pagination with customizable items per page
 * - Search functionality across title and details
 * - Sorting by creation date (newest first)
 * - User information lookup via aggregation
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllcases = async (req, res) => {
  try {
    // Get pagination parameters from query string or use defaults
    const page = parseInt(req.query.page) || 1;

    // Ensure itemsPerPage is one of the allowed values
    let itemsPerPage = parseInt(req.query.itemsPerPage) || 10;
    const allowedItemsPerPage = [5, 10, 25]; // Available options
    if (!allowedItemsPerPage.includes(itemsPerPage)) {
      itemsPerPage = 10; // Default to 10 if not a valid option
    }

    // Get search input if provided
    const searchInput = req.query.searchInput || '';

    // Calculate skip value for pagination (how many records to skip)
    const skip = (page - 1) * itemsPerPage;

    // Create query based on search input
    let query = {};
    if (searchInput) {
      // Search in both title and details fields (case-insensitive)
      query = {
        $or: [
          { title: { $regex: searchInput, $options: "i" } },
          { details: { $regex: searchInput, $options: "i" } },
        ],
      };
      console.log(getLogTime() + "Search query: " + searchInput);
    }

    // Get total count of matching records for pagination calculations
    const totalRecords = await Helpcase.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    // Build MongoDB aggregation pipeline for efficient querying
    const pipeline = [
      // Join with users collection to get user information
      {
        $lookup: {
          from: "users",          // Collection to join with
          localField: "user",     // Field from help cases
          foreignField: "_id",    // Field from users
          as: "userInfo",         // Output array field
        },
      },
      // Unwind the userInfo array (convert from array to object)
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true, // Keep records even if no user found
        },
      },
      // Sort by creation date (newest first)
      {
        $sort: {
          createdAt: -1,
        },
      }
    ];

    // Add search filter if search input is provided
    if (searchInput) {
      pipeline.unshift({
        $match: query
      });
    }

    // Add pagination stages to limit results
    pipeline.push(
      {
        $skip: skip    // Skip records based on page number
      },
      {
        $limit: itemsPerPage  // Limit number of records returned
      }
    );

    // Execute the aggregation pipeline
    const recordsDB = await Helpcase.aggregate(pipeline);

    // Format dates for display
    for (let x = 0; x < recordsDB.length; x++) {
      recordsDB[x].StringDate = getTimestamp(recordsDB[x].createdAt);
    }

    // Calculate pagination display information
    const startIndex = totalRecords === 0 ? 0 : (page - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalRecords);

    // Prepare pagination data for the template
    const pagination = {
      page,                // Current page number
      itemsPerPage,        // Items per page
      totalPages,          // Total number of pages
      totalRecords,        // Total number of records
      startIndex,          // Starting index of current page
      endIndex,            // Ending index of current page
      hasPrevPage: page > 1,                  // Whether there's a previous page
      hasNextPage: page < totalPages,         // Whether there's a next page
      prevPage: page - 1,                     // Previous page number
      nextPage: page + 1,                     // Next page number
      pages: generatePaginationArray(page, totalPages)  // Array of page numbers to display
    };

    // Available options for items per page dropdown
    const itemsPerPageOptions = [5, 10, 25];

    // Render the index template with all necessary data
    res.render("index", {
      records: recordsDB,          // Help case records
      pagination,                  // Pagination information
      itemsPerPageOptions,         // Items per page options
      searchTerm: searchInput,     // Current search term
      query: req.query             // All query parameters (for maintaining state)
    });
  } catch (err) {
    // Log the error for debugging
    console.error("Error fetching records:", err);

    // Render error page with unique error ID
    res.status(500).render("500", {
      layout: 'main',
      title: '500 - Server Error',
      errorId: 'ERR-DB-' + Date.now().toString(36)  // Generate unique error ID
    });
  }
};

export const postSearchDetails = async (req, res) => {
  try {
    console.log(getLogTime() + " somebody search " + req.body.searchInput);

    // Get pagination parameters from query string or use defaults
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;

    // Calculate skip value for pagination
    const skip = (page - 1) * itemsPerPage;

    // Create search query
    const searchQuery = {
      $or: [
        { title: { $regex: req.body.searchInput, $options: "i" } },
        { details: { $regex: req.body.searchInput, $options: "i" } },
      ],
    };

    // Get total count of matching records for pagination
    const totalRecords = await Helpcase.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    // Fetch records with pagination
    const recordsDB = await Helpcase.find(searchQuery)
      .lean()
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(itemsPerPage)
      .exec();

    // Format dates
    for (let x = 0; x < recordsDB.length; x++) {
      recordsDB[x].StringDate = getTimestamp(recordsDB[x].createdAt);
    }

    // Calculate start and end indices for display
    const startIndex = totalRecords === 0 ? 0 : (page - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalRecords);

    // Prepare pagination data
    const pagination = {
      page,
      itemsPerPage,
      totalPages,
      totalRecords,
      startIndex,
      endIndex,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
      pages: generatePaginationArray(page, totalPages)
    };

    // Prepare items per page options (5, 10, and 25)
    const itemsPerPageOptions = [5, 10, 25];

    // Render the page with pagination data and search term
    res.render("index", {
      records: recordsDB,
      pagination,
      itemsPerPageOptions,
      searchTerm: req.body.searchInput,
      isSearchResult: true,
      query: req.query // Pass query parameters for maintaining state
    });
  } catch (err) {
    console.error("Error searching records:", err);
    res.status(500).render("500", {
      layout: 'main',
      title: '500 - Server Error',
      errorId: 'ERR-SEARCH-' + Date.now().toString(36)
    });
  }
};

/**
 * Process Contact Form Submission
 *
 * Handles the submission of the contact form from the About page.
 * Creates a new help case with the admin user as the owner.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
/**
 * Search Help Cases
 *
 * Dedicated search page that allows users to search for help cases
 * without requiring login. Includes pagination and filtering.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchHelpCases = async (req, res) => {
  try {
    // Get pagination parameters from query string or use defaults
    const page = parseInt(req.query.page) || 1;

    // Ensure itemsPerPage is one of the allowed values
    let itemsPerPage = parseInt(req.query.itemsPerPage) || 10;
    const allowedItemsPerPage = [5, 10, 25]; // Available options
    if (!allowedItemsPerPage.includes(itemsPerPage)) {
      itemsPerPage = 10; // Default to 10 if not a valid option
    }

    // Get search input if provided
    const searchInput = req.query.searchInput || '';

    // If no search input and not a direct page request, render empty search page
    if (!searchInput && !req.query.page) {
      return res.render("search", {
        title: "Search Help Cases",
        pagination: null,
        records: null,
        searchTerm: '',
        query: req.query
      });
    }

    // Calculate skip value for pagination (how many records to skip)
    const skip = (page - 1) * itemsPerPage;

    // Create query based on search input
    let query = {};
    if (searchInput) {
      // Search in both title and details fields (case-insensitive)
      query = {
        $or: [
          { title: { $regex: searchInput, $options: "i" } },
          { details: { $regex: searchInput, $options: "i" } },
        ],
      };
      console.log(getLogTime() + "Search query: " + searchInput);
    }

    // Get total count of matching records for pagination calculations
    const totalRecords = await Helpcase.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    // Build MongoDB aggregation pipeline for efficient querying
    const pipeline = [
      // Join with users collection to get user information
      {
        $lookup: {
          from: "users",          // Collection to join with
          localField: "user",     // Field from help cases
          foreignField: "_id",    // Field from users
          as: "userInfo",         // Output array field
        },
      },
      // Unwind the userInfo array (convert from array to object)
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true, // Keep records even if no user found
        },
      },
      // Sort by creation date (newest first)
      {
        $sort: {
          createdAt: -1,
        },
      }
    ];

    // Add search filter if search input is provided
    if (searchInput) {
      pipeline.unshift({
        $match: query
      });
    }

    // Add pagination stages to limit results
    pipeline.push(
      {
        $skip: skip    // Skip records based on page number
      },
      {
        $limit: itemsPerPage  // Limit number of records returned
      }
    );

    // Execute the aggregation pipeline
    const recordsDB = await Helpcase.aggregate(pipeline);

    // Format dates for display
    for (let x = 0; x < recordsDB.length; x++) {
      recordsDB[x].StringDate = getTimestamp(recordsDB[x].createdAt);
    }

    // Calculate pagination display information
    const startIndex = totalRecords === 0 ? 0 : (page - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalRecords);

    // Prepare pagination data for the template
    const pagination = {
      page,                // Current page number
      itemsPerPage,        // Items per page
      totalPages,          // Total number of pages
      totalRecords,        // Total number of records
      startIndex,          // Starting index of current page
      endIndex,            // Ending index of current page
      hasPrevPage: page > 1,                  // Whether there's a previous page
      hasNextPage: page < totalPages,         // Whether there's a next page
      prevPage: page - 1,                     // Previous page number
      nextPage: page + 1,                     // Next page number
      pages: generatePaginationArray(page, totalPages)  // Array of page numbers to display
    };

    // Available options for items per page dropdown
    const itemsPerPageOptions = [5, 10, 25];

    // Render the search template with all necessary data
    res.render("search", {
      title: "Search Results",
      records: recordsDB,          // Help case records
      pagination,                  // Pagination information
      itemsPerPageOptions,         // Items per page options
      searchTerm: searchInput,     // Current search term
      query: req.query             // All query parameters (for maintaining state)
    });
  } catch (err) {
    // Log the error for debugging
    console.error("Error searching records:", err);

    // Render error page with unique error ID
    res.status(500).render("500", {
      layout: 'main',
      title: '500 - Server Error',
      errorId: 'ERR-SEARCH-' + Date.now().toString(36)  // Generate unique error ID
    });
  }
};

export const postSendMsg = (req, res) => {
  // Log the submission for debugging
  console.log(getLogTime() + "Contact form submission: " + req.body.subject);

  // Validate form input
  let errors = [];

  // Check for required fields
  if (!req.body.subject) {
    errors.push({ text: "Please add a subject" });
  }

  if (!req.body.message) {
    errors.push({ text: "Please add some message" });
  }

  // If validation fails, re-render the form with errors
  if (errors.length > 0) {
    res.render("about", {
      errors: errors,
      subject: req.body.subject,     // Preserve user input
      message: req.body.message,     // Preserve user input
    });
  } else {
    // Create a new help case from the contact form
    const newhelpcase = {
      title: req.body.subject,
      details: req.body.message,
      user: process.env.ADMIN_USER_ID,  // Set admin as the owner
      offer: "admin",                   // Mark as admin-created
    };

    // Save the new help case to the database
    new Helpcase(newhelpcase)
      .save()
      .then((helpcase) => {
        // Show success message and redirect
        req.flash("success_msg", "Your message has been received!");
        res.redirect("/about");
      })
      .catch((err) => {
        // Handle database errors
        console.error("Error saving contact message:", err);
        req.flash("error_msg", "There was an error processing your message. Please try again.");
        res.redirect("/about");
      });
  }
};