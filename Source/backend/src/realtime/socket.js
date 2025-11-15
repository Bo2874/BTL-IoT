import { Server } from "socket.io";

let ioInstance = null;

export function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  ioInstance.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);
    socket.on("disconnect", () => console.log("🔌 Socket disconnected:", socket.id));
  });

  return ioInstance;
}

export function getIO() {
  if (!ioInstance) throw new Error("Socket.io not initialized");
  return ioInstance;
}

export function emitSensorUpdate(payload) {
  if (ioInstance) {
    ioInstance.emit("sensor:update", payload);
  }
}
