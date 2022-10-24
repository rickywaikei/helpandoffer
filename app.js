//Project helpandoffer main program: ./app.js

// WEB APP Framework
import express from 'express'; 

// TEMPLATE ENGINE (other choices: mustache, jQuery, EJS)
import { create } from 'express-handlebars'; 

// mongoDB driver
import mongoose from "mongoose"; 

// MIDDLEWAREs
// May use JWT instead!!!
// Why need both connect-flash and express-session!!!
import flash from "connect-flash"; // middleware for session and cookieParser 

import session from "express-session"; // middleware for session 

import bodyParser from "body-parser"; // middleware Parse incoming request req.body property

import morgan from "morgan"; // middleware HTTP request level .use() preset: tiny, dev, combined, common, short

import methodOverride from "method-override"; // middleware use HTTP verbs i.e. PUT or DELETE

import passport from "passport"; // middleware to authenticate requests
passportConfig(passport);

// ROUTERS
import defaultRoute from "./routes/default.Route.js"; 
import helpcasesRoute from "./routes/helpcases.Route.js"; 
import usersRoute from "./routes/usersRoute.js"; 

// HELPERS functions
import {passportConfig, ensureAuthenticated, getTimestamp, getLogTime, validatePhoneNumber} from "./helpers/helper.js"; 

// JSON CONFIGURATION FILE for static variables
import config from "./config.json" assert {type: 'json'};

const app = express();

const hbs = create({
  // Specify helpers which are only registered on this instance.
  helpers: {
      stringTime() { return getTimestamp(); },
      isPhonenbr() { return validatePhoneNumber();},      
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views'); // for .render() to lookup views 

mongoose
.connect(config.db.mongoURI)
.then(()=> console.log("Mongodb connected.."))
.catch(err=>console.log(err));

app.use(morgan("tiny")); // logs HTTP request and errors i.e. GET / 404
app.use(express.static('views/public')); // serve static files like JS/CSS

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(methodOverride("_method"));

app.use(
  session({
    secret: "anything",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 1000, // 600 seconds
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());  //handle global variables
app.use(function(req,res,next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.fail_passport = req.flash("fail_passport");
  res.locals.user = req.user || null;
  next();
});

// send the render page by changing send function render function
// app.get('/', (req, res, next) => { 
//     const title = "Welcome !";
//     res.render('index', {title: title,
//       helpers: {
//       foo() {return 'foo.';}
//     }
//   });
// });

// allow public to view and search site information without login
app.use("/", defaultRoute);
app.get('/about', (req, res) => {
    res.render('about');
});

app.use("/helpcases", ensureAuthenticated, helpcasesRoute);
app.use("/users", usersRoute); 

// Error handling
app.use("*", (req, res) => {
  res.status(404);
  res.render("404");
});

const PORT = config.app.PORT || "3000";

app.listen(PORT, () => {
    console.log(getLogTime() + `Server started on port ${PORT}`);
});
