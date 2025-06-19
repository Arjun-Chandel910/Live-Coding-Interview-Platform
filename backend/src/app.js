import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
const app = express();
const corsOptions = {
  origin: "*",
  method: ["POST", "GET"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

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
