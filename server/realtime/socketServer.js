import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Server } from "socket.io";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const conversationRoom = (id) => `conversation:${id}`;
const userRoom = (id) => `user:${id}`;

export const attachSocketServer = (httpServer, allowedOrigins) => {
  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
    transports: ["websocket"],
    allowRequest: (req, callback) => {
      const origin = req.headers.origin;
      let sameOrigin = false;
      try {
        const forwardedProto = String(req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
        const parsedOrigin = new URL(origin);
        sameOrigin = parsedOrigin.host === req.headers.host && parsedOrigin.protocol === `${forwardedProto}:`;
      } catch {}
      callback(null, !origin || sameOrigin || allowedOrigins.includes(origin));
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (!payload.userId) return next(new Error("Invalid authentication token"));
      socket.data.userId = String(payload.userId);
      return next();
    } catch {
      return next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(userRoom(socket.data.userId));

    socket.on("conversation:join", async (payload = {}, acknowledge = () => {}) => {
      try {
        const { conversationId } = payload;
        if (!mongoose.isValidObjectId(conversationId)) return acknowledge({ error: "Invalid conversation" });
        const conversation = await Conversation.findOne({ _id: conversationId, participants: socket.data.userId }).select("_id");
        if (!conversation) return acknowledge({ error: "Conversation not found" });
        await socket.join(conversationRoom(conversationId));
        const messages = await Message.find({ conversation: conversationId })
          .sort({ createdAt: 1 }).limit(500).populate("sender", "name profileImage").lean();
        return acknowledge({ ok: true, messages });
      } catch {
        return acknowledge({ error: "Could not join conversation" });
      }
    });

    socket.on("message:send", async (payload = {}, acknowledge = () => {}) => {
      try {
        const { conversationId } = payload;
        const content = typeof payload.content === "string" ? payload.content.trim() : "";
        if (!mongoose.isValidObjectId(conversationId)) return acknowledge({ error: "Invalid conversation" });
        if (!content || content.length > 4000) return acknowledge({ error: "Message must be between 1 and 4000 characters" });
        const conversation = await Conversation.findOne({ _id: conversationId, participants: socket.data.userId });
        if (!conversation) return acknowledge({ error: "Conversation not found" });
        if (!socket.rooms.has(conversationRoom(conversationId))) return acknowledge({ error: "Join the conversation before sending messages" });

        const message = await Message.create({ conversation: conversation._id, sender: socket.data.userId, content });
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();
        await message.populate("sender", "name profileImage");
        const messageData = message.toObject();
        io.to(conversationRoom(conversationId)).emit("message:new", messageData);
        for (const participantId of conversation.participants) {
          io.to(userRoom(String(participantId))).emit("conversation:updated", { conversationId: String(conversationId) });
        }
        return acknowledge({ ok: true, message: messageData });
      } catch {
        return acknowledge({ error: "Message could not be sent" });
      }
    });
  });

  return io;
};
