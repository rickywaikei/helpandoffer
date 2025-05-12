// ./controllers/avatarController.js
import { getLogTime } from "../helpers/helper.js";
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

// Handle avatar upload
export const handleAvatarUpload = (req, res) => {
  upload.single("avatarUpload")(req, res, (err) => {
    if (err) {
      console.error("Avatar upload error:", err);
      req.flash("error_msg", err.message || req.__('errors.avatarUploadError'));
      return res.redirect("/users/myprofile");
    }

    // No file was uploaded
    if (!req.file) {
      console.log("No file uploaded");
      req.flash("error_msg", req.__('errors.selectFile'));
      return res.redirect("/users/myprofile");
    }

    console.log("File uploaded:", req.file.path);

    try {
      // Read file and convert to base64
      const avatarData = fs.readFileSync(req.file.path).toString("base64");
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
  });
};

// Handle avatar deletion
export const handleAvatarDelete = (req, res) => {
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
