// ./controllers/userController.js
import { getTimestamp, getLogTime } from "../helpers/helper.js";
import bcrypt from "bcryptjs";
import passport from "passport";
import User from "../models/User.js";
import multer from "multer";
import * as fs from "fs";

const storageSetting = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const uploadAvatar = multer({
  storage: storageSetting,
  fileFilter: (req, file, cb) => {
    const mimetype = file.mimetype;
    if (
      mimetype === "image/png" ||
      mimetype === "image/jpg" ||
      mimetype === "image/jpeg" ||
      mimetype === "image/gif"
    ) {
      cb(null, true);
    } else {
      req.flash("error_msg", "Wrong file type for avatar");
      cb(null, false);
    }
  },
}).single("avatarUpload");

export const getRegister = (req, res) => {
  res.render("users/register");
};

export const postRegister = (req, res) => {
  let errors = [];
  if (!req.body.name) {
    errors.push({ text: "Name is missing !" });
  }
  if (!req.body.email) {
    errors.push({ text: "Email is missing !" });
  }
  if (req.body.password.length < 4) {
    errors.push({ text: "Password must be at least 4 characters !" });
  }
  if (req.body.password != req.body.password2) {
    errors.push({ text: "Password do not match !" });
  }
  if (errors.length > 0) {
    res.render("users/register", {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      password2: req.body.password2,
    });
  } else {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then(() => {
            req.flash("success_msg", "Register Done !");
            res.redirect("/users/login");
          })
          .catch((err) => {
            console.log(err);
            req.flash("error_msg", "Server went wrong !");
            res.redirect("/users/register");
            return;
          });
      });
    });
  }
};

export const getLogin = (req, res) => {
  res.render("users/login");
};

export const postLogin = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/helpcases",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
  console.log(getLogTime() + " login: " + req.body.usernameInput); // todo login 
};

export const getLogout = (req, res) => {
  // console.log(getLogTime() + " logout: " + res.locals.user.name); // todo logout
  req.logout((err) => {
    if (err) throw err;
    req.flash("success_msg", "You're logged out !");
    res.redirect("/users/login");
  });
};

export const getMyprofile = (req, res) => {
  res.render("users/myprofile", {
    name: res.locals.user.name,
    email: res.locals.user.email,
    phone: res.locals.user.phone,
    avatar: res.locals.user.avatar,
    badge: res.locals.user.badge,
    isAdmin: res.locals.user.isAdmin,
  });
};

export const postMyprofile = (req, res) => {
  User.findOne({ _id: res.locals.user._id }).then((user) => {
    if (req.file) {
      let avatarData = fs.readFileSync(req.file.path).toString("base64");
      let avatarContentType = req.file.mimetype;

      user.avatar.data = avatarData;
      user.avatar.contentType = avatarContentType;

      fs.unlink(req.file.path, (err) => {
        if (err) throw err;
      });

      user.save().then(() => {
        console.log(getLogTime() + res.locals.user.name + " UploadAvatar"); // todo upload avatar
        req.flash("success_msg", "Avatar uploaded !");
        res.redirect("/users/myprofile");
      });
    } else {
      req.flash(
        "error_msg",
        " choose a correct file before clicking 'Upload Avatar' button"
      );
      res.redirect("/users/myprofile");
    }
  });
};

export const deleteAvatar = (req, res) => {
  User.updateOne(
    { _id: res.locals.user._id },
    {
      $unset: {
        avatar: "",
      },
    }
  ).then(() => {
    req.flash("success_msg", "Avatar successfully deleted !");
    res.redirect("/users/myprofile");
  });
};


export const getProfiles = (req, res) => {
  User.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userProfiles",
      },
    },
    {
      $unwind: {
        path: "$userProfiles",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]).then((profilesDB) => {
    for (let x = 0; x < profilesDB.length; x++) {
      profilesDB[x].StringDate = getTimestamp(profilesDB[x].createdAt);
    }
    if (res.locals.user.isAdmin) {
      res.render("users/profilesAdmin", { profiles: profilesDB });
    } else {
      res.render("users/profiles", { profiles: profilesDB });
    }    
  });
};

export const deleteUser = (req,res) => {
    User.deleteOne({_id: req.params.id}).then(()=> {
      req.flash("error_msg", "User Deleted !");
      res.redirect("/users/profiles");
    });
  };
  
  export const postAddBadge = (req, res) => {
    User.findOne({ _id: req.params.id}).then((badgeuser) => {
      if (badgeuser.name != res.locals.user._id)
      badgeuser.badge++;
      badgeuser.save().then(() => {
        req.flash("success_msg", "A badge is given to the user !");
        res.redirect("/users/profiles");
      });
    });
    };

    export const getEditUser = (req, res)=> {
      User.findOne({_id: req.params.id})
      .lean()
      .then((user) => {
        res.render("users/edit", { user: user });
      });
    };
    
    export const postEditUser = (req, res) => {
        User.findOne({ _id: req.params.id}).then((user) => {
    let errors = [];
      if (req.body.password) {          
        if (req.body.password.length < 4) {
          errors.push({ text: "Password must be at least 4 characters !" });
        }
        if (req.body.password != req.body.password2) {
          errors.push({ text: "Password do not match !" });
        }
      }
        if (errors.length > 0) {
          res.render("users/profiles", {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            password2: req.body.password2,
          });
        } else {
            if (req.body.email) {
              user.email = req.body.email;
            }
            if (req.body.phone) {
              user.phone = req.body.phone;
            }
            user.password = req.body.password;
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) throw err;
                user.password = hash;
                user
                  .save()
                  .then(() => {
                    console.log(getLogTime()+ " " + user.name + " changed password")
                    req.flash("success_msg", "Updated this user information !");
                    res.redirect("/users/profiles");
                  })
                  .catch((err) => {
                    console.log(err);
                    req.flash("error_msg", "Server rejected, please correct your inputs !");
                    res.redirect("/users/profiles");
                    return;
                  });
              });
            });
          };
        });
      };

export const putUpdateMyprofile = (req, res) => {
  User.findOne({ _id: res.locals.user._id}).then((user) => {
    let errors = [];
      if (req.body.password) {          
        if (req.body.password.length < 4) {
          errors.push({ text: "Password must be at least 4 characters !" });
        }
        if (req.body.password != req.body.password2) {
          errors.push({ text: "Password do not match !" });
        }
      }
        if (errors.length > 0) {
          res.render("users/myprofile", {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            password2: req.body.password2,
          });
        } else {
            if (req.body.email) {
              user.email = req.body.email;
            }
            if (req.body.phone) {
              user.phone = req.body.phone;
            }
            user.password = req.body.password;
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) throw err;
                user.password = hash;
                user
                  .save()
                  .then(() => {
                    console.log(getLogTime()+ " " + user.name + " changed password")
                    req.flash("success_msg", "Updated this user information !");
                    res.redirect("/users/myprofile");
                  })
                  .catch((err) => {
                    console.log(err);
                    req.flash("error_msg", "Server rejected, please correct your inputs !");
                    res.redirect("/users/myprofile");
                    return;
                  });
              });
            });
          };
        });
      };

    // export const postProfile = (req, res) => {
    //   User.findOne({ _id: req.params.id }).then((user) => {
    //     if (req.file) {
    //       let avatarData = fs.readFileSync(req.file.path).toString("base64");
    //       let avatarContentType = req.file.mimetype;
    
    //       user.avatar.data = avatarData;
    //       user.avatar.contentType = avatarContentType;
    
    //       // fs.unlink(req.file.path, (err) => {
    //       //   if (err) throw err;
    //       // });
    
    //       user.save().then(() => {
    //         req.flash("success_msg", "Avatar uploaded !");
    //         res.redirect("/users/myprofile");
    //       });
    //     } else {
    //       req.flash(
    //         "error_msg",
    //         " choose a correct file before clicking 'Upload Avatar' button"
    //       );
    //       res.redirect("/users/myprofile"); 
    //     }
    //   });
    // };