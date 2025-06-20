import { Schema, model } from "mongoose";

const questionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    visibleTestCases: [
      {
        type: Schema.Types.ObjectId,
        ref: "TestCase",
        required: true,
      },
    ],
    hiddenTestCases: [
      {
        type: Schema.Types.ObjectId,
        ref: "TestCase",
      },
    ],
    constraints: { type: String },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const Question = model("Question", questionSchema);
export default Question;
