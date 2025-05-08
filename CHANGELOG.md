# Changelog

All notable changes to the Help and Offer Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
