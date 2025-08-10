import Question from "../models/question.model.js";
const messages = {};
const initInterviewSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => {
      console.log(` ${socket.id} joined at ${roomId}`);
      socket.join(roomId);

      const clientsInRoom = io.sockets.adapter.rooms.get(roomId);
      const numberOfClients = clientsInRoom ? clientsInRoom.size : 0;

      if (numberOfClients > 1) {
        // Someone already in room → notify this client
        socket.to(roomId).emit("already-in-room"); // or fetch name from DB
      } //send popup

      socket.to(roomId).emit("remote-user-joined"); // // // socket.data.name = name; // store name for later // socket.data.roomId = roomId; //store id for later
    }); //  message handling .
    socket.on("message", (roomId, sender, content) => {
      if (messages[roomId] == undefined) {
        messages[roomId] = [];
      }
      messages[roomId].push({ sender, content });
      io.to(roomId).emit("new-message", { sender, content });
    }); //signaling channels
    socket.on("offer", ({ offer, senderId, roomId }) => {
      socket.to(roomId).emit("receive-offer", { offer, senderId });
    });
    socket.on("answer", ({ answer, senderId, roomId }) => {
      socket.to(roomId).emit("receive-answer", { answer, senderId });
    });
    socket.on("ice-candidate", ({ candidate, senderId, roomId }) => {
      socket.to(roomId).emit("ice-candidate", { candidate, senderId });
    }); //toggle audio

    socket.on("toggle-audio", ({ enabled, roomId }) => {
      socket.to(roomId).emit("toggle-audio", { enabled });
    }); // toggle video

    socket.on("toggle-video", ({ enabled, roomId }) => {
      socket.to(roomId).emit("toggle-video", { enabled });
    }); // drawing on
    socket.on("start-drawing", (roomId) => {
      io.to(roomId).emit("start-drawing"); // CORRECTED: io.to() instead of socket.to()
    });
    socket.on("stop-drawing", (roomId) => {
      io.to(roomId).emit("stop-drawing"); // CORRECTED: io.to() instead of socket.to()
    }); // disconnection logic

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
