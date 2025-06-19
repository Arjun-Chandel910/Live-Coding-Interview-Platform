import { Router } from "express";
const router = Router();

router.get("/login", (req, res) => {
  res.send("hi");
  console.log("hi");
});

export default router;
