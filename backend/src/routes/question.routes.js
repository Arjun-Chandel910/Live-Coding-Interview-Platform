import { Router } from "express";
import { getQuestions } from "../controllers/question.controller.js";
const router = Router();

router.route("/problemset").get(getQuestions);

export default router;
