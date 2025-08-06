// models/Meeting.js
import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema({
  meetingName: {
    type: String,
    required: true,
    trim: true,
  },
  meetingUrl: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
    default: null,
  },
});

const Meeting = mongoose.model("Meeting", MeetingSchema);
export default Meeting;
