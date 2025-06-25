import { Router } from "express";
import {
  getQuestionById,
  getQuestions,
} from "../controllers/question.controller.js";
const router = Router();

router.route("/problemset").get(getQuestions);
router.route("/problemset/:id").get(getQuestionById);

export default router;
