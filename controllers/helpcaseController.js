// ./controllers/helpcaseController.js
import { getTimestamp, getLogTime } from "../helpers/helper.js";
import Helpcase from "../models/Helpcase.js";
import User from "../models/User.js";

export const getHelpcases = (req, res) => {
  Helpcase.find({ user: res.locals.user._id })
    .lean()
    .sort({ createdAt: "desc" })
    .then((helpcases) => {
      for (let x = 0; x < helpcases.length; x++) {
        //helpcases[x].StringDate = helpcases[x].createdAt.toLocaleString();
        helpcases[x].StringDate = getTimestamp(helpcases[x].createdAt);
      }
      res.render("helpcases/index", { helpcases: helpcases });
    });
};

export const postAddHelpcase = (req, res) => {
  let errors = []; // push error message if empty input
  if (!req.body.title) {
    errors.push({ text: req.__('messages.addTitle') });
  }
  if (!req.body.details) {
    errors.push({ text: req.__('messages.addDetails') });
  }
  // if there are errors, render the page with error message
  if (errors.length > 0) {
    res.render("helpcases/add", {
      errors: errors,
      title: req.body.title,
      details: req.body.details,
    });
  } else {
    const newhelpcase = {
      title: req.body.title,
      details: req.body.details,
      user: res.locals.user._id,
    };
    new Helpcase(newhelpcase).save().then((helpcase) => {
      req.flash("success_msg", req.__('messages.addNewCase'));
      res.redirect("/helpcases");
    });
  }
};

export const getAddHelpcase = (req, res) => {
  //re-factoring
  res.render("helpcases/add");
};

export const getEditHelpcase = (req, res) => {
  Helpcase.findOne({ _id: req.params.id })
    .lean()
    .then((helpcase) => {
      res.render("helpcases/edit", { helpcase: helpcase });
    });
};

export const putEditHelpcase = (req, res) => {
  Helpcase.findOne({ _id: req.params.id }).then((helpcase) => {
    if (req.body.solved == "SOLVED") {
      helpcase.solved = 1;
    }
    if (req.body.solved == "REOPEN") {
      helpcase.solved = 0;
    }
    if (req.body.offer == "REMOVE") {
      helpcase.offer = null;
    }
    helpcase.title = req.body.title; //processed by bodyparser
    helpcase.details = req.body.details;
    helpcase.save().then(() => {
      req.flash("success_msg", req.__('messages.caseUpdated'));
      res.redirect("/helpcases");
    });
  });
};

export const deleteHelpcase = (req, res) => {
  Helpcase.deleteOne({ _id: req.params.id }).then(() => {
    req.flash("error_msg", req.__('messages.caseDeleted'));
    res.redirect("/helpcases");
  });
};

export const getRecords = (req, res) => {
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
    if (res.locals.user.isAdmin) {
      console.log(
        getLogTime() +
          "admin account: " +
          res.locals.user.name +
          " read all cases"
      );
      res.render("helpcases/recordsAdmin", { records: recordsDB });
    } else {
      res.render("helpcases/records", { records: recordsDB });
    }
  });
};

export const getOffercases = (req, res) => {
  Helpcase.find({ offer: res.locals.user.name })
    .lean()
    .sort({ createdAt: "desc" })
    .then((offercases) => {
      for (let x = 0; x < offercases.length; x++) {
        offercases[x].StringDate = getTimestamp(offercases[x].createdAt);
      }
      res.render("helpcases/offered", { offercases: offercases });
    });
};

export const getAddoffer = (req, res) => {
  Helpcase.findOne({ _id: req.params.id })
    .lean()
    .then((helpcase) => {
      res.render("helpcases/addoffer", { helpcase: helpcase });
    });
};

export const putAddoffer = (req, res) => {
  Helpcase.findOne({ _id: req.params.id }).then((offercase) => {
    offercase.offer = res.locals.user.name;
    offercase.offermsg =
      getTimestamp() + res.locals.user.name + ": " + req.body.offermsg;
    offercase.save().then(() => {
      req.flash("success_msg", req.__('messages.offerAdded'));
      res.redirect("/helpcases/offered");
    });
  });
};

export const getUpdateoffer = (req, res) => {
  Helpcase.findOne({ _id: req.params.id })
    .lean()
    .then((offercase) => {
      res.render("helpcases/update", { helpcase: offercase });
    });
};

export const putUpdateoffer = (req, res) => {
  Helpcase.findOne({ _id: req.params.id }).then((offercase) => {
    if (offercase.offer == null) {
      if (offercase.user != res.locals.user.id) {
        offercase.offer = res.locals.user.name;
      }
    }
    if (req.body.offer == "REMOVE") {
      offercase.offer = null;
    }
    offercase.offermsg =
      getTimestamp() +
      res.locals.user.name +
      ": " +
      req.body.offermsg +
      "\n" +
      offercase.offermsg;
    offercase.save().then(() => {
      req.flash("success_msg", req.__('messages.caseUpdated'));
      if (offercase.offer == res.locals.user.name) {
        res.redirect("/helpcases/offered");
      } else {
        res.redirect("/helpcases");
      }
    });
  });
};

export const getRemoveoffer = (req, res) => {
  Helpcase.findOne({ _id: req.params.id })
    .lean()
    .then((offercase) => {
      res.render("helpcases/remove", { offercase: offercase });
    });
};

export const putRemoveoffer = (req, res) => {
  Helpcase.findOne({ _id: req.params.id }).then((offercase) => {
    offercase.offer = null;
    offercase.offermsg =
      getTimestamp() +
      res.locals.user.name +
      ": *** offerer role remove from this case ***" +
      "\n" +
      offercase.offermsg;
    offercase.save().then(() => {
      req.flash("success_msg", req.__('messages.caseUpdated'));
      res.redirect("/helpcases/offered");
    });
  });
};

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
    res.render("helpcases/admin", { records: recordsDB });
  });
};

export const putGiveBadge = (req, res, next) => {
  if (req.params.offer) {
    User.findOne({ name: req.params.offer }).then((offeruser) => {
      if (offeruser.name != res.locals.user.name) offeruser.badge++;
      console.log(
        getLogTime() +
          res.locals.user.name +
          " gives a badge to " +
          offeruser.name
      );
      offeruser.save().then(() => {
        req.flash("success_msg", req.__('messages.badgeGiven'));
        res.redirect("/helpcases");
      });
    });
  }
};