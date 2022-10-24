// ./controllers/defaultController.js
import { getLogTime, getTimestamp } from "../helpers/helper.js";
import Helpcase from "../models/Helpcase.js";

export const getAllcases = (req, res) => {
  Helpcase.aggregate([
      { 
          $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "userInfo",
          },
      },
      { 
          $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true,
          },
      },
      { 
        $sort: {
          createdAt: -1,
        },
      },
    ]).then((recordsDB) => {
      for (let x = 0; x < recordsDB.length; x++) {
        recordsDB[x].StringDate = getTimestamp(recordsDB[x].createdAt);
      }
      res.render("index", { records: recordsDB });
  });
};

export const postSearchDetails = (req, res) => {
  console.log(getLogTime() + " somebody search " + req.body.searchInput);
  Helpcase.find({$or:[{title: {$regex: req.body.searchInput, $options: 'i'}},
                      {details: {$regex: req.body.searchInput, $options: 'i'}}
                     ]
                }
  )
  .lean()
  .sort({ createdAt: "desc" })
  .then((recordsDB) => {
    for (let x = 0; x < recordsDB.length; x++) {
      recordsDB[x].StringDate = getTimestamp(recordsDB[x].createdAt);
    }
      res.render("index", { records: recordsDB });
  });
};

export const postSendMsg = (req, res)=> {
  console.log(req.body.subject + " " + req.body.message)
  let errors = []; // push error message if empty input
  if (! req.body.subject) {
      errors.push({text: "Please add a subject"});
  }
  if (! req.body.message) {
      errors.push({text: "Please add some message"});
  }
  // if there are errors, render the page with error message
  if  (errors.length > 0) {
    res.render("about", {
      errors: errors,
      subject: req.body.subject,
      message: req.body.message
    });
  } else {
      const newhelpcase = {
      title: req.body.subject,
      details: req.body.message,
      user: '634e166886d97d838dcb6b86',
      offer: 'admin'
      };
      new Helpcase(newhelpcase).save().then((helpcase) => {
        req.flash("success_msg", "New case added !");
        res.redirect("/about");
      });
    }
};