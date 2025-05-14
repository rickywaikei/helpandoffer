# Changelog

All notable changes to the Help and Offer Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.4.1] - 2023-05-14

### Added
- Consistent version display across all pages using the _version partial
- Improved form styling with better spacing and font sizes
- Enhanced mobile responsiveness for all forms and tables

### Changed
- Updated version number in package.json and all templates
- Improved error handling for CSRF token validation
- Enhanced user experience with more consistent UI elements

### Fixed
- Fixed CSRF token generation to prevent duplicate tokens and 500 errors
- Fixed version display inconsistency across pages
- Improved form field alignment and spacing on mobile devices

## [3.2.0] - 2025-12-05

### Added
- Enhanced phone number validation to support multiple international formats
- Support for various phone number formats with or without country codes
- Multi-language support for all error messages and info messages in controller files
- Multi-language support for authentication messages in helper.js

### Changed
- Updated phone number format examples in all forms to show "+123 456-7890"
- Improved error message translations for better user experience
- Enhanced authentication error handling with proper translations

### Fixed
- Fixed authentication error messages to properly display in the user's selected language
- Improved error handling in passport configuration

## [3.1.0] - 2025-10-15

### Added
- Consistent header style across all pages
- Version number display in the background of all pages
- Improved mobile responsiveness for tables

### Changed
- Reduced space between navbar and carousel on home page
- Redesigned navbar layout with properly centered language dropdown menu
- Applied consistent design style from About page to all other pages

### Fixed
- Fixed status badge styling to ensure background colors fully cover text in mobile view
- Fixed My Profile page with working Delete Avatar, Upload Avatar, and Save Profile buttons

## [3.0.0] - 2025-08-05

### Added
- Multi-language support for the entire application (English, Traditional Chinese, Simplified Chinese)
- Internationalization for all user-facing text, including form labels, buttons, and messages
- Redesigned About page with improved layout and user experience
- Mission & Vision section on the About page
- Improved contact form with better validation
- Confirmation dialogs for all delete operations

### Changed
- Updated navbar with centered navigation items (Home, Search, About, Language)
- Renamed dropdown items in navbar for better clarity (My Requested Cases → Cases, My Profile → User Profile)
- Replaced text labels with intuitive icons for action buttons
- Improved mobile responsiveness across all pages
- Enhanced form styling for better user experience
- Updated all templates to support multi-language functionality

### Fixed
- Logout functionality now works correctly with proper multi-language support
- Fixed CSRF token issues in forms
- Improved error handling with translated error messages
- Fixed styling issues on mobile devices

## [2.0.0] - 2023-07-15

### Added
- Comprehensive documentation in README.md
- Detailed code comments throughout the codebase
- Support for Hong Kong phone number format (+852 9876-4321)
- Pagination with options for 5, 10, and 25 items per page
- Search functionality without requiring login
- Custom 404 and 500 error pages with return to home option
- Comprehensive .gitignore file
- CHANGELOG.md to track changes

### Changed
- Improved mobile responsiveness
- Enhanced navbar alignment on small screens
- Optimized card width to display all columns without horizontal scrolling
- Updated font sizes to be responsive to screen width
- Improved CSRF protection for logout functionality
- Enhanced documentation with detailed API endpoints
- Updated project structure documentation

### Fixed
- Logout issues by changing direct logout link to form submission with CSRF protection
- Pagination issues by updating dropdown to correctly show selected items per page
- Removed unwanted boolean text from pagination controls

## [1.0.0] - 2022-12-01

### Added
- Initial release of the Help and Offer Platform
- User authentication and authorization
- Create, read, update, and delete help cases
- Offer help to existing help cases
- User profiles with badges
- Admin dashboard for managing users and help cases
- Basic responsive design
- Simple pagination
