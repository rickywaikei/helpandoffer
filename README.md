**Demo site**: _http://helpandoffer.mooo.com_

**Deployment**: _https://hub.docker.com/repository/docker/rickychan/helpandoffer_

**Developers:** _(1) T0RENIA  (11) ChimChim2022 (15) HeathAu (22) rickywaikei_

**Requirement:**
node version: 18.10.0
mongoDB version: MongoDB Atlas (default) or mongoDB community 5.0.12 or above
Default setup of MongoDB Atlas only permit ip address from SCOPE office at TST, please contact our team member if you want to connect from other location.

**node module versions:**
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
    
**Installation:**
git clone https://github.com/rickywaikei/helpandoffer.git
cd ./helpandoffer
nvm install 18.10.0
nvm use 18.10.0
npm install
_-1. Edit config.json to change static variables i.e. PORT (default 3000) and mongo (default MongoDB Atlas)_
_- 2. Start your local mongod (need version 5.0.12 or above)_
_     if not using MongoDB cloud_
start app.js
npm run dev
