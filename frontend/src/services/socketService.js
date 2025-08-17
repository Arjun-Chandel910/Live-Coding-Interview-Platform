// services/socketService.js

import { io } from "socket.io-client";

let socket;

export const connectSocket = (serverUrl) => {
  if (!socket) {
    socket = io(serverUrl);
  }
  return socket;
};

export const getSocket = () => socket;

export const emitEvent = (eventName, payload) => {
  if (socket) socket.emit(eventName, payload);
};

export const listenEvent = (eventName, callback) => {
  if (socket) socket.on(eventName, callback);
};

export const removeListener = (eventName, callback) => {
  if (socket) socket.off(eventName, callback);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners(); //prevent memory leaks
    socket.disconnect();
    socket = null;
  }
};
