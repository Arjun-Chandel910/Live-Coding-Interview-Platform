import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createRoom,
  getMeetingHistory,
  sendInvite,
} from "../controllers/interview.controller.js";
const router = Router();

// router.route("/create-room").post(createRoom);
router.route("/send-invite").post(sendInvite);
router.get("/history", authMiddleware, getMeetingHistory);
export default router;
