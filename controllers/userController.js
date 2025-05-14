// ./controllers/userController.js
import { getTimestamp, getLogTime, validatePhoneNumber } from "../helpers/helper.js";
import bcrypt from "bcryptjs";
import passport from "passport";
import User from "../models/User.js";
import multer from "multer";
import * as fs from "fs";

// Improved file upload security
const storageSetting = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    // Generate a secure filename with timestamp and user ID to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = file.originalname.split('.').pop();
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}.${fileExt}`);
  },
});

// Limit file size to 2MB
const fileSize = 2 * 1024 * 1024;

// Create the multer upload instance
const upload = multer({
  storage: storageSetting,
  limits: {
    fileSize: fileSize
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PNG, JPG and JPEG files are allowed"), false);
    }
  },
});

// Function that handles file upload with callback
export const uploadAvatar = (req, res, callback) => {
  upload.single("avatarUpload")(req, res, callback);
};

export const getRegister = (req, res) => {
  res.render("users/register");
};

export const postRegister = (req, res) => {
  let errors = [];
  if (!req.body.name) {
    errors.push({ text: req.__('errors.nameMissing') });
  }
  if (!req.body.email) {
    errors.push({ text: req.__('errors.emailMissing') });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    errors.push({ text: req.__('errors.emailInvalid') });
  }

  // Add phone number validation
  if (req.body.phone && !validatePhoneNumber(req.body.phone)) {
    errors.push({ text: req.__('errors.phoneInvalid') });
  }
  // Improved password requirements
  if (!req.body.password) {
    errors.push({ text: req.__('errors.passwordRequired') });
  } else if (req.body.password.length < 8) {
    errors.push({ text: req.__('errors.passwordLength') });
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(req.body.password)) {
    errors.push({ text: req.__('errors.passwordComplex') });
  }
  if (req.body.password != req.body.password2) {
    errors.push({ text: req.__('errors.passwordMatch') });
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
            req.flash("success_msg", req.__('messages.registerSuccess'));
            res.redirect("/users/login");
          })
          .catch((err) => {
            console.log(err);
            req.flash("error_msg", req.__('errors.serverError'));
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
  // Use a custom callback to handle successful login
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Login error:", err);
      return next(err);
    }

    // If authentication failed
    if (!user) {
      // Check if the message is a translation key
      if (info && info.message && info.message.includes('.')) {
        req.flash("error_msg", req.__(info.message));
      } else {
        req.flash("error_msg", info.message || req.__('errors.invalidCredentials'));
      }
      return res.redirect("/users/login");
    }

    // Log in the user
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("Login error:", loginErr);
        return next(loginErr);
      }

      console.log(getLogTime() + " login: " + user.name);

      // Redirect to the returnTo URL if it exists, otherwise to helpcases
      const returnTo = req.session.returnTo || "/helpcases";
      delete req.session.returnTo;

      return res.redirect(returnTo);
    });
  })(req, res, next);
};

export const getLogout = (req, res) => {
  // console.log(getLogTime() + " logout: " + res.locals.user.name); // todo logout
  req.logout((err) => {
    if (err) throw err;
    req.flash("success_msg", req.__('messages.logoutSuccess'));
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
    isAdmin: res.locals.user.isAdmin
  });
};

export const postMyprofile = (req, res) => {
  try {
    console.log("Avatar upload started");

    // Check if file was uploaded
    if (!req.file) {
      console.log("No file uploaded");
      req.flash("error_msg", req.__('errors.selectFile'));
      return res.redirect("/users/myprofile");
    }

    console.log("File uploaded:", req.file.path);

    // Read file and convert to base64
    let avatarData;
    try {
      avatarData = fs.readFileSync(req.file.path).toString("base64");
    } catch (err) {
      console.error("Error reading file:", err);
      req.flash("error_msg", req.__('errors.fileProcessError'));
      return res.redirect("/users/myprofile");
    }

    const avatarContentType = req.file.mimetype;

    // Find user and update avatar
    User.findById(res.locals.user._id)
      .then(user => {
        if (!user) {
          console.log("User not found");
          req.flash("error_msg", req.__('errors.userNotFound'));
          return res.redirect("/users/myprofile");
        }

        // Set avatar data
        if (!user.avatar) {
          user.avatar = {};
        }

        user.avatar.data = avatarData;
        user.avatar.contentType = avatarContentType;

        // Save user
        return user.save();
      })
      .then(() => {
        // Delete temporary file
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Error deleting temp file:", err);
        }

        console.log(getLogTime() + " " + res.locals.user.name + " uploaded avatar");
        req.flash("success_msg", req.__('messages.avatarUploaded'));
        res.redirect("/users/myprofile");
      })
      .catch(err => {
        console.error("Error saving avatar:", err);
        req.flash("error_msg", req.__('errors.avatarUploadError'));
        res.redirect("/users/myprofile");
      });
  } catch (error) {
    console.error("Unexpected error in avatar upload:", error);
    req.flash("error_msg", req.__('errors.serverError'));
    res.redirect("/users/myprofile");
  }
};

export const deleteAvatar = (req, res) => {
  console.log("Delete avatar started");
  console.log("Deleting avatar for user:", res.locals.user._id);

  // Find user and remove avatar
  User.findByIdAndUpdate(
    res.locals.user._id,
    { $unset: { avatar: "" } },
    { new: true }
  )
    .then(() => {
      console.log(getLogTime() + " " + res.locals.user.name + " deleted avatar");
      req.flash("success_msg", req.__('messages.avatarDeleted'));
      res.redirect("/users/myprofile");
    })
    .catch(err => {
      console.error("Error deleting avatar:", err);
      req.flash("error_msg", req.__('errors.avatarDeleteError'));
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

export const deleteUser = (req, res) => {
  User.deleteOne({ _id: req.params.id }).then(() => {
    req.flash("error_msg", req.__('errors.userDeleted'));
    res.redirect("/users/profiles");
  });
};

export const postAddBadge = (req, res) => {
  User.findOne({ _id: req.params.id }).then((badgeuser) => {
    if (badgeuser.name != res.locals.user._id) badgeuser.badge++;
    badgeuser.save().then(() => {
      req.flash("success_msg", req.__('messages.badgeGiven'));
      res.redirect("/users/profiles");
    });
  });
};

export const getEditUser = (req, res) => {
  User.findOne({ _id: req.params.id })
    .lean()
    .then((user) => {
      res.render("users/edit", { user: user });
    });
};

export const postEditUser = (req, res) => {
  User.findOne({ _id: req.params.id }).then((user) => {
    let errors = [];
    // Validate email if provided
    if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
      errors.push({ text: req.__('errors.emailInvalid') });
    }

    // Validate phone if provided
    if (req.body.phone && !validatePhoneNumber(req.body.phone)) {
      errors.push({ text: req.__('errors.phoneInvalid') });
    }

    if (req.body.password) {
      // Improved password requirements
      if (req.body.password.length < 8) {
        errors.push({ text: req.__('errors.passwordLength') });
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(req.body.password)) {
        errors.push({ text: req.__('errors.passwordComplex') });
      }
      if (req.body.password != req.body.password2) {
        errors.push({ text: req.__('errors.passwordMatch') });
      }
    }
    if (errors.length > 0) {
      // Add validation errors as flash messages
      errors.forEach(error => {
        req.flash("error_msg", error.text);
      });

      // Render the edit form again with the user data
      res.render("users/edit", {
        user: {
          _id: req.params.id,
          name: user.name,
          email: req.body.email || user.email,
          phone: req.body.phone || user.phone
        }
      });
    } else {
      if (req.body.email) {
        user.email = req.body.email;
      }
      if (req.body.phone) {
        user.phone = req.body.phone;
      }

      // Only update password if provided
      if (req.body.password) {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            console.error("Error generating salt:", err);
            req.flash("error_msg", req.__('errors.passwordUpdateError'));
            return res.redirect("/users/profiles");
          }

          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err) {
              console.error("Error hashing password:", err);
              req.flash("error_msg", req.__('errors.passwordUpdateError'));
              return res.redirect("/users/profiles");
            }

            user.password = hash;
            user.save()
              .then(() => {
                console.log(getLogTime() + " " + user.name + " changed password");
                req.flash("success_msg", req.__('messages.userUpdated'));
                res.redirect("/users/profiles");
              })
              .catch((err) => {
                console.error("Error saving user:", err);
                req.flash("error_msg", req.__('errors.serverError'));
                res.redirect("/users/profiles");
              });
          });
        });
      } else {
        // No password change, just save other fields
        user.save()
          .then(() => {
            console.log(getLogTime() + " " + user.name + " updated profile");
            req.flash("success_msg", req.__('messages.userUpdated'));
            res.redirect("/users/profiles");
          })
          .catch((err) => {
            console.error("Error saving user:", err);
            req.flash("error_msg", req.__('errors.serverError'));
            res.redirect("/users/profiles");
          });
      }
    }
  }).catch(err => {
    console.error("Error finding user:", err);
    req.flash("error_msg", req.__('errors.userNotFound'));
    res.redirect("/users/profiles");
  });
};

export const putUpdateMyprofile = (req, res) => {
  console.log("Profile update started");
  console.log("Form data:", req.body);

  // Find user
  User.findById(res.locals.user._id)
    .then(user => {
      if (!user) {
        console.log("User not found");
        req.flash("error_msg", req.__('errors.userNotFound'));
        return res.redirect("/users/myprofile");
      }

      let errors = [];

      // Validate email if provided
      if (req.body.email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
          errors.push({ text: req.__('errors.emailInvalid') });
        } else {
          user.email = req.body.email;
        }
      }

      // Validate phone if provided
      if (req.body.phone) {
        if (!validatePhoneNumber(req.body.phone)) {
          errors.push({ text: req.__('errors.phoneInvalid') });
        } else {
          user.phone = req.body.phone;
        }
      }

      // Validate password if provided
      if (req.body.password && req.body.password.trim() !== '') {
        if (req.body.password.length < 8) {
          errors.push({ text: req.__('errors.passwordLength') });
        } else if (req.body.password !== req.body.password2) {
          errors.push({ text: req.__('errors.passwordMatch') });
        } else {
          // Password is valid, will be updated below
        }
      }

      if (errors.length > 0) {
        console.log("Validation errors:", errors);
        return res.render("users/myprofile", {
          errors: errors,
          name: user.name,
          email: req.body.email || user.email,
          phone: req.body.phone || user.phone,
          avatar: user.avatar,
          badge: user.badge,
          isAdmin: user.isAdmin
        });
      }

      // Update password if provided and valid
      if (req.body.password && req.body.password.trim() !== '' && req.body.password === req.body.password2) {
        bcrypt.genSalt(10, (saltErr, salt) => {
          if (saltErr) {
            console.error("Error generating salt:", saltErr);
            req.flash("error_msg", req.__('errors.passwordUpdateError'));
            return res.redirect("/users/myprofile");
          }

          bcrypt.hash(req.body.password, salt, (hashErr, hash) => {
            if (hashErr) {
              console.error("Error hashing password:", hashErr);
              req.flash("error_msg", req.__('errors.passwordUpdateError'));
              return res.redirect("/users/myprofile");
            }

            user.password = hash;

            user.save()
              .then(() => {
                console.log(getLogTime() + " " + user.name + " updated profile with new password");
                req.flash("success_msg", req.__('messages.profileUpdatedWithPassword'));
                res.redirect("/users/myprofile");
              })
              .catch(err => {
                console.error("Error saving user:", err);
                req.flash("error_msg", req.__('errors.profileUpdateError'));
                res.redirect("/users/myprofile");
              });
          });
        });
      } else {
        // No password change, just save other fields
        user.save()
          .then(() => {
            console.log(getLogTime() + " " + user.name + " updated profile");
            req.flash("success_msg", req.__('messages.profileUpdated'));
            res.redirect("/users/myprofile");
          })
          .catch(err => {
            console.error("Error saving user:", err);
            req.flash("error_msg", req.__('errors.profileUpdateError'));
            res.redirect("/users/myprofile");
          });
      }
    })
    .catch(err => {
      console.error("Error finding user:", err);
      req.flash("error_msg", req.__('errors.profileUpdateError'));
      res.redirect("/users/myprofile");
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