import { Schema, model } from "mongoose";

const testcaseSchema = new Schema(
  {
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Testcase = model("Testcase", testcaseSchema);
export default Testcase;
