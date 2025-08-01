import { Router } from "express";
import { createRoom } from "../controllers/interview.controller.js";
const router = Router();

router.route("/create-room").post(createRoom);
export default router;
