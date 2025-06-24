import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import Question from "../models/question.model.js";
export const getQuestions = async (req, res) => {
  res.json({ message: "hi " });
};
