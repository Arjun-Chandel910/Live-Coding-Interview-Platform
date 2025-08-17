import * as awarenessProtocol from "y-protocols/awareness.js";

export class SocketIOSignalingProvider {
  constructor(roomId, ydoc, socket) {
    this.roomId = roomId;
    this.ydoc = ydoc;
    this.socket = socket;
    this.awareness = new awarenessProtocol.Awareness(ydoc);

    // Listen for Yjs signaling messages
    this.socket.on("yjs-signal", ({ room, payload }) => {
      if (room === this.roomId && this.onMessage) {
        this.onMessage(payload);
      }
    });

    // Awareness update handling
    this.socket.on("yjs-awareness", ({ room, update }) => {
      if (room === this.roomId) {
        awarenessProtocol.applyAwarenessUpdate(this.awareness, update, this);
      }
    });

    // Method for WebRTC/Yjs to send messages
    this.send = (msg) => {
      this.socket.emit("yjs-signal", {
        room: this.roomId,
        payload: msg,
      });
    };

    // Broadcast awareness changes
    this.awareness.on("update", ({ added, updated, removed }) => {
      const update = awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
        ...added,
        ...updated,
        ...removed,
      ]);
      this.socket.emit("yjs-awareness", {
        room: this.roomId,
        update,
      });
    });
  }
}
