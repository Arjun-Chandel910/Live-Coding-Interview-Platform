import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import Testcase from "../models/testcase.model.js";

export const getTestcases = async (req, res) => {
  const testcases = await Testcase.find({});
  res.json({ testcases });
};
