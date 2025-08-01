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
    //signaling channels
    socket.on("offer", ({ offer, senderId, targetId }) => {
      console.log("offer : from  ", senderId);
      socket.to(targetId).emit("receive-offer", { offer, senderId });
    });

    socket.on("answer", ({ answer, senderId, targetId }) => {
      console.log("answer from : ", senderId);
      socket.to(targetId).emit("receive-answer", { answer, senderId });
    });

    socket.on("ice-candidate", ({ candidate, senderId, targetId }) => {
      console.log("candidate from ", senderId);
      socket.to(targetId).emit("ice-candidate", { candidate, senderId });
    });
  });
};
export default initInterviewSocket;
