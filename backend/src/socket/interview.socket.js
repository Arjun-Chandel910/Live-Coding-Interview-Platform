import Question from "../models/question.model.js";
const messages = {};
const initInterviewSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-room", (roomId, name) => {
      console.log(` ${socket.id} joined at ${roomId}`);
      socket.join(roomId);
      socket.to(roomId).emit("newUserJoined", { name });
      socket.data.name = name; // store name for later
      socket.data.roomId = roomId; //store id for later
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
    socket.on("offer", ({ offer, senderId, roomId }) => {
      console.log("offer : from  ", senderId);
      io.to(roomId).emit("receive-offer", { offer, senderId });
    });

    socket.on("answer", ({ answer, senderId, roomId }) => {
      console.log("answer from : ", senderId);
      io.to(roomId).emit("receive-answer", { answer, senderId });
    });

    socket.on("ice-candidate", ({ candidate, senderId, roomId }) => {
      console.log("candidate from ", senderId);
      io.to(roomId).emit("ice-candidate", { candidate, senderId });
    });
    socket.on("disconnect", () => {
      const name = socket.data.name;
      const roomId = socket.data.roomId;

      if (roomId) {
        socket.to(roomId).emit("user-left", {
          socketId: socket.id,
          name: name || "Unknown user",
        });

        const room = io.sockets.adapter.rooms.get(roomId);
        if (!room || room.size === 0) {
          delete messages[roomId];
        }
      }
    });
  });
};

export default initInterviewSocket;
