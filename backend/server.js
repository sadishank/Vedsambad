import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import mongoose from "mongoose";

// create express application and http server
const app = express();
const server = http.createServer(app);

// setup socket.io server
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// store online users
export const userSocketMap = {};

// handle socket connections
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    console.log("Anonymous connection rejected");
    return socket.disconnect();
  }
  console.log("User connected:", userId);
  userSocketMap[userId] = socket.id;

  // if (userId) userSocketMap[userId] = socket.id;

  // immit online event
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  // handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    // immit online event
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// middleware setup
app.use(express.json({ limit: "5mb" }));
app.use(cors());

// routs setup
app.use("/api/status", (req, res) => {
  res.send("Server is running");
});
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// connect to MongoDB
await connectDB();

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
