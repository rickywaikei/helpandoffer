Requirement:
node version: 18.10.0 or above
mongoDB version: 5.0.12 or above or MongoDB Atlas (default)
Default setup of MongoDB Atlas only permit ip address from SCOPE, please contact our team member
if you want to connect from other location.

node module versions:
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "connect-flash": "^0.1.1",
    "dotenv": "^16.0.2",
    "express": "^4.18.1",
    "express-handlebars": "^6.0.6",
    "express-session": "^1.17.3",
    "method-override": "^3.0.0",
    "mongoose": "^6.6.2",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "passport": "^0.6.0",
    "passport-local": "^1.0.0",
    "twilio": "^3.82.1"

Installation:
mkdir -p {pathto}/helpandoffer
cd {pathto}/helpandoffer
git clone {link to repositories.git}
nvm install 18.10.0
nvm use 18.10.0
npm install
// 1. Edit config.json to change static variables i.e. PORT (default 3000) and mongo (default MongoDB Atlas)
// 2. Start your local mongod (need version 5.0.12 or above) 
      if not using MongoDB cloud
// start app.js
npm run dev

