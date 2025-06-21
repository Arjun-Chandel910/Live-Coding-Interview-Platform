import { Router } from "express";
import {
  register,
  login,
  googleOAuthHandler,
} from "../controllers/user.controller.js";
const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/auth/google/callback").post(googleOAuthHandler);

export default router;
