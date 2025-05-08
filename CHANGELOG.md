# Changelog

All notable changes to the Help and Offer Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
