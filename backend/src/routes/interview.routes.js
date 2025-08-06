import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createRoom,
  getMeetingHistory,
} from "../controllers/interview.controller.js";
const router = Router();

router.route("/create-room").post(createRoom);
router.get("/history", authMiddleware, getMeetingHistory);
export default router;
