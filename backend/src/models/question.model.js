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
        ref: "Testcase",
        required: true,
      },
    ],
    hiddenTestCases: [
      {
        type: Schema.Types.ObjectId,
        ref: "Testcase",
      },
    ],
    constraints: { type: String },
  },
  { timestamps: true }
);
const Question = model("Question", questionSchema);
export default Question;
