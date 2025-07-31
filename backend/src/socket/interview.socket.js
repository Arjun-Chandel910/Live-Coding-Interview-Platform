import Question from "../models/question.model.js";
const messages = {};
const initInterviewSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => {
      console.log(` ${socket.id} joined at ${roomId}`);
      socket.join(roomId);
    });

    //  message handling .
    socket.on("message", (roomId, sender, content) => {
      if (messages[roomId] == undefined) {
        messages[roomId] = [];
      }
      messages[roomId].push({ sender, content });
      io.to(roomId).emit("new-message", { sender, content });
    });
  });
};
export default initInterviewSocket;
