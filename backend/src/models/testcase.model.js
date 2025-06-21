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
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const Testcase = model("Testcase", testcaseSchema);
export default Testcase;
