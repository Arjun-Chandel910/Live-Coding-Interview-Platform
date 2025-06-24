import { Router } from "express";
import { getTestcases } from "../controllers/testcase.controller.js";
const router = Router();

router.route("/").get(getTestcases);

export default router;
