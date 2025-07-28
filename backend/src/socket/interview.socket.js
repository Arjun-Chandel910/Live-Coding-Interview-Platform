import Question from "../models/question.model";

const initInterviewSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(socket);
    socket.on("join-room", (roomId) => {
      console.log(`socket ${socket.id} joined room ${roomId}`);
      socket.join(roomId);
    });
  });
};
export default initInterviewSocket;
