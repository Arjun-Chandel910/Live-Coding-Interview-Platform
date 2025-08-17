import Question from "../models/question.model.js";

const messages = {};

const initInterviewSocket = (io) => {
  io.on("connection", (socket) => {
    // console.log(`Socket connected: ${socket.id}`);

    // --- JOIN ROOM LOGIC ---
    socket.on("join-room", (roomId) => {
      // console.log(`${socket.id} joined room ${roomId}`);
      socket.join(roomId);

      const clientsInRoom = io.sockets.adapter.rooms.get(roomId);
      const numberOfClients = clientsInRoom ? clientsInRoom.size : 0;

      // Store info for disconnect cleanup
      socket.data.roomId = roomId;

      if (numberOfClients > 1) {
        // Notify the new joiner that someone is already inside
        socket.emit("already-in-room");

        // Tell the other peer to start WebRTC
        socket.to(roomId).emit("remote-user-joined", { socketId: socket.id });
      }
    });

    // --- CHAT MESSAGES ---
    socket.on("message", (payload) => {
      const { roomId, sender, content } = payload;
      console.log(sender, " sent ", content);
      if (!messages[roomId]) messages[roomId] = [];
      messages[roomId].push({ sender, content });
      io.to(roomId).emit("new-message", { sender, content });
    });

    // --- CUSTOM OFFER/ANSWER/CANDIDATES (if not using y-webrtc) ---
    socket.on("offer", ({ offer, roomId }) => {
      // CRITICAL FIX: Explicitly add the senderId from the socket's ID
      socket.to(roomId).emit("receive-offer", { offer, senderId: socket.id });
    });

    socket.on("answer", ({ answer, roomId }) => {
      // CRITICAL FIX: Explicitly add the senderId from the socket's ID
      socket.to(roomId).emit("receive-answer", { answer, senderId: socket.id });
    });

    socket.on("ice-candidate", ({ candidate, roomId }) => {
      // CRITICAL FIX: Explicitly add the senderId from the socket's ID
      socket
        .to(roomId)
        .emit("ice-candidate", { candidate, senderId: socket.id });
    });

    // --- AUDIO/VIDEO TOGGLE ---
    socket.on("toggle-audio", ({ enabled, roomId }) => {
      socket.to(roomId).emit("toggle-audio", { enabled });
    });

    socket.on("toggle-video", ({ enabled, roomId }) => {
      socket.to(roomId).emit("toggle-video", { enabled });
    });

    // --- DRAWING EVENTS ---
    socket.on("start-drawing", (roomId) => {
      io.to(roomId).emit("start-drawing");
    });

    socket.on("stop-drawing", (roomId) => {
      io.to(roomId).emit("stop-drawing");
    });

    // --- YJS SIGNALLING FOR y-WEBRTC ---
    socket.on("yjs-announce", ({ roomId, data }) => {
      socket.to(roomId).emit("yjs-announce", { data });
    });

    socket.on("yjs-signal", ({ roomId, data }) => {
      socket.to(roomId).emit("yjs-signal", { data });
    });

    // --- DISCONNECT CLEANUP ---
    socket.on("disconnect", () => {
      const roomId = socket.data.roomId;
      if (roomId) {
        socket.to(roomId).emit("user-left", {
          socketId: socket.id,
          name: socket.data.name || "Unknown user",
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
