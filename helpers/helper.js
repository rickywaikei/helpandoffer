// ./helpers/helper.js
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import config from "../config.json" assert {type: 'json'};

export const passportConfig = (passport) => {
    passport.use(
      new LocalStrategy({ usernameField : "usernameInput"}, function(
        usernameInput, 
        passwordInput, 
        done
      ) {
        User.findOne({name: usernameInput}).then((user) => {
            if (!user) {
                return done(null, false, {
                    type: "fail_passport", 
                    message: "User not found, please try again !",
                    });
            }
            bcrypt.compare(passwordInput, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                  return done(null, false, {
                    type: "fail_passport",
                    message: "Incorrect password !",
                  });
                }
              });
            });
        })
    );
    passport.serializeUser(function (user,done) {
        done(null,user.id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, function(err, user) {
            done(err,user);
        });
    });
}

export const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    };
    req.flash("error_msg", "Session timeout or not authorized, please login again !");
    console.log(":Session timeout or not authorized !");
    res.redirect("/users/login");
};

export const getTimestamp = (current) => {
    if (!current) {
    current = new Date();
    };
    return (current.toLocaleString('en-US', { hour12: false }).concat(" "));
};

export const getLogTime = () => {
    if (config.app.logTIME) {
    let current = new Date();
    return (current.toLocaleString('en-US', { hour12: false }).concat(" "));
    } else return "";
};

export const validatePhoneNumber = (input_str) => {
    let re = /^\?(\d{3})\)?[- ]?(\d{4})[- ]?(\d{4})$/;
    return re.test(input_str);
};



