import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/users.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/profile", authRequired, getProfile);
router.put("/profile", authRequired, updateProfile);

export default router;
