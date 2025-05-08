# Help and Offer Platform

A web application that connects people who need help with those who can offer assistance. This platform allows users to post help requests, browse available offers, and connect with others in their community.

## 🌟 Features

- **User Authentication**: Secure login and registration system
- **Help Requests**: Post and manage help requests
- **Responsive Design**: Mobile-friendly interface optimized for all devices
- **Search Functionality**: Find specific help requests or offers without requiring login
- **Pagination**: Browse through listings with customizable items per page (5, 10, or 25 items)
- **CSRF Protection**: Enhanced security for form submissions and logout
- **Error Handling**: Custom 404 and 500 error pages with return to home option
- **Phone Number Support**: Validation for Hong Kong phone number format (+852 9876-4321)
- **User Profiles**: Detailed user profiles with badges and achievements
- **Multi-language Support**: Full internationalization with English, Traditional Chinese, and Simplified Chinese
- **Modern UI**: Redesigned About page with improved layout and user experience
- **Graphical Action Buttons**: Intuitive icons instead of text labels for actions
- **Centered Navigation**: Improved navbar with centered navigation items
- **Confirmation Dialogs**: Confirmation prompts for all delete operations

## 🔧 Technologies

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas or Community Edition)
- **Template Engine**: Handlebars
- **Authentication**: Passport.js with Local Strategy
- **Frontend**: Bootstrap, JavaScript
- **Security**: bcrypt.js for password hashing, CSRF protection

## 📋 Prerequisites

- **Node.js**: Version 18.10.0 or higher
- **MongoDB**: Atlas (cloud) or Community Edition 5.0.12 or higher
- **npm**: Latest version recommended

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rickywaikei/helpandoffer.git
   cd helpandoffer
   ```

2. **Set up Node.js environment**
   ```bash
   nvm install 18.10.0
   nvm use 18.10.0
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your MongoDB connection string and other configuration options.

5. **Create a config.json file**
   ```bash
   touch config.json
   ```
   Add the following content to the file:
   ```json
   {
     "mongoURI": "your_mongodb_connection_string",
     "sessionSecret": "your_session_secret"
   }
   ```

6. **Set up .gitignore**
   The project includes a comprehensive .gitignore file that excludes:
   - node_modules/
   - .env files
   - log files
   - temporary files
   - IDE-specific files

7. **Start the application**
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:3000

## 📁 Project Structure

- **app.js**: Main application entry point
- **controllers/**: Contains controller logic
  - **defaultController.js**: Handles default routes
  - **helpcaseController.js**: Handles help case related routes
  - **userController.js**: Handles user related routes
- **helpers/**: Contains helper functions
  - **helper.js**: General helper functions
- **models/**: Contains database models
  - **Helpcase.js**: Help case model
  - **User.js**: User model
- **routes/**: Contains route definitions
  - **default.Route.js**: Default routes
  - **helpcases.Route.js**: Help case routes
  - **usersRoute.js**: User routes
- **views/**: Contains Handlebars templates
  - **layouts/**: Layout templates
  - **partials/**: Partial templates
  - **helpcases/**: Help case templates
  - **users/**: User templates

## ⚙️ Configuration

- **Database**: Configure MongoDB connection in `config.json` file
- **Port**: Default is 3000, can be changed in `app.js`
- **Session Secret**: Set a strong random string in `config.json` file for session security

## 🔌 API Endpoints

### Default Routes
- `GET /`: Home page
- `GET /about`: About page
- `GET /search`: Search functionality

### User Routes
- `GET /users/login`: Login page
- `POST /users/login`: Login user
- `GET /users/register`: Registration page
- `POST /users/register`: Register user
- `POST /users/logout`: Logout user (CSRF protected)
- `GET /users/myprofile`: User profile page
- `GET /users/edit/:id`: Edit user page
- `PUT /users/edit/:id`: Update user
- `GET /users/profiles`: All profiles page
- `GET /users/profiles/admin`: Admin profiles page
- `GET /users/addbadge/:id`: Add badge page
- `POST /users/addbadge/:id`: Add badge to user

### Help Case Routes
- `GET /helpcases`: Help cases page
- `GET /helpcases/add`: Add help case page
- `POST /helpcases`: Create help case
- `GET /helpcases/edit/:id`: Edit help case page
- `PUT /helpcases/:id`: Update help case
- `DELETE /helpcases/:id`: Delete help case
- `GET /helpcases/addoffer/:id`: Add offer page
- `POST /helpcases/addoffer/:id`: Add offer to help case
- `GET /helpcases/records`: User's help case records
- `GET /helpcases/records/admin`: Admin help case records
- `GET /helpcases/offered`: User's offered help cases

## 🔒 Security Notes

- Default MongoDB Atlas setup only permits connections from specific IP addresses
- For production, set `secure: true` for cookies and use HTTPS
- Generate a strong session secret for production environments
- All forms are protected with CSRF tokens
- Passwords are hashed using bcrypt

## 👥 Contributors

- T0RENIA
- ChimChim2022
- HeathAu
- rickywaikei

## 📄 License

This project is licensed under the ISC License.

---

© 2022-2026 Help and Offer Platform. All rights reserved.