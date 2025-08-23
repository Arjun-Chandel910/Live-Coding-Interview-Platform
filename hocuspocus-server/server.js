import { Server } from "@hocuspocus/server";
import dotenv from "dotenv";
dotenv.config();
// Configure the server …
const server = new Server({
  port: process.env.PORT,
});

// … and run it!
server.listen();
