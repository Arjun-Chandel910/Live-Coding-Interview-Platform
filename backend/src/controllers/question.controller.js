import dotenv from "dotenv";
dotenv.config();
import Question from "../models/question.model.js";
import AppError from "../middlewares/AppError.js";

export const getQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({});
    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return next(new AppError(500, error?.message || "Internal server error"));
  }
};

export const getQuestionById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const question = await Question.findById(id)
      .populate("hiddenTestCases")
      .populate("visibleTestCases");

    if (!question) {
      return next(new AppError(404, "Question not found"));
    }

    return res.status(200).json(question);
  } catch (error) {
    console.error("Error fetching question by ID:", error);
    return next(new AppError(500, error?.message || "Internal server error"));
  }
};
