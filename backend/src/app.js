import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
const app = express();
// routes
import userRoute from "./routes/user.routes.js";
import questionRoute from "./routes/question.routes.js";
//
const corsOptions = {
  origin: "*",
  method: ["POST", "GET"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoute);
app.use("/api/v1", questionRoute);

import { createServer } from "http";
const server = createServer(app);

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("DB connected");
  server.listen(process.env.PORT || 8000, () => {
    console.log("Listing to PORT 8000");
  });
};

connect();
