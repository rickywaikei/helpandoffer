//./routes/helpcases.Route.js  (15 APIs for helpcaseControllers)
import express from "express";

import { 
    getAddHelpcase, 
    postAddHelpcase, 
    getHelpcases,
    deleteHelpcase, 
    getEditHelpcase, 
    putEditHelpcase,
    getRecords,
    getOffercases,
    getAddoffer,
    putAddoffer,
    getUpdateoffer,
    putUpdateoffer,
    getRemoveoffer,
    putRemoveoffer,
    putGiveBadge,
} from "../controllers/helpcaseController.js";

const router = express.Router();
router.get("/", getHelpcases).post("/", postAddHelpcase);
router.get("/add",getAddHelpcase);
router.get("/edit/(:id)", getEditHelpcase).put("/edit/(:id)", putEditHelpcase);
router.delete("/(:id)", deleteHelpcase);
router.get("/records", getRecords);

router.get("/offered", getOffercases);
router.get("/addoffer/(:id)", getAddoffer).put("/addoffer/(:id)", putAddoffer);

router.get("/update/(:id)", getUpdateoffer).put("/update/(:id)", putUpdateoffer);
router.get("/remove/(:id)", getRemoveoffer).put("/remove/(:id)", putRemoveoffer);
router.put("/givebadge/(:offer)", putGiveBadge);
export default router;