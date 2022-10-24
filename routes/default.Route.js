//./routes/default.Route.js
import express from "express";

import { 
    getAllcases,
    postSearchDetails,
    postSendMsg
} from "../controllers/defaultController.js";

const router = express.Router();
router.get("/", getAllcases);
router.post("/search", postSearchDetails);
router.post("/sendmsg", postSendMsg);
export default router;