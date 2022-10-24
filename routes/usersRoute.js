// ./routes/usersRoute.js (15 APIs for userControllers)
import express from "express";

import { 
    getRegister, 
    postRegister, 
    getLogin,
    postLogin, 
    getLogout,
    
    getMyprofile,
    uploadAvatar,
    postMyprofile,
    deleteAvatar,
    putUpdateMyprofile,

    getProfiles,
    deleteUser,
    postAddBadge,
    getEditUser,
    postEditUser,

} from "../controllers/userController.js";

import {ensureAuthenticated} from "../helpers/helper.js";

const router = express.Router();

router.route("/register").get(getRegister).post(postRegister);
router.route("/login").get(getLogin).post(postLogin);
router.get("/logout", getLogout);

router.get("/myprofile", ensureAuthenticated, getMyprofile);
router.post("/myprofile", ensureAuthenticated, uploadAvatar, postMyprofile);
router.delete("/myprofile", ensureAuthenticated, deleteAvatar);
router.put("/update", ensureAuthenticated, putUpdateMyprofile);

router.get("/profiles", ensureAuthenticated, getProfiles);
router.delete("/(:id)", ensureAuthenticated, deleteUser);
router.post("/addbadge/(:id)", ensureAuthenticated, postAddBadge);
router.get("/edit/(:id)", ensureAuthenticated, getEditUser).put("/edit/(:id)", ensureAuthenticated, postEditUser);

export default router;