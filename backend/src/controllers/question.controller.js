import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import Question from "../models/question.model.js";
import Testcase from "../models/testcase.model.js";

export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({})
      .populate("visibleTestCases")
      .populate("hiddenTestCases");

    res.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Server error" });
  }
};
