import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const pairKeyFor = (first, second) => [String(first), String(second)].sort().join(":");
const validId = (id) => mongoose.isValidObjectId(id);

export const listConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.userId })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "name role profileImage")
      .populate("lastMessage", "content sender createdAt")
      .lean();
    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

export const startConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.userId;
    if (!validId(recipientId)) return res.status(400).json({ error: "A valid recipient is required" });
    if (String(recipientId) === String(senderId)) return res.status(400).json({ error: "You cannot message yourself" });
    const recipient = await User.findById(recipientId).select("_id");
    if (!recipient) return res.status(404).json({ error: "Recipient not found" });

    const pairKey = pairKeyFor(senderId, recipientId);
    const participants = [senderId, recipientId].sort();
    const conversation = await Conversation.findOneAndUpdate(
      { pairKey },
      { $setOnInsert: { pairKey, participants } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("participants", "name role profileImage");
    res.status(200).json({ conversation });
  } catch (error) {
    if (error.code === 11000) {
      try {
        const conversation = await Conversation.findOne({ pairKey: pairKeyFor(req.user.userId, req.body.recipientId) })
          .populate("participants", "name role profileImage");
        return res.json({ conversation });
      } catch (lookupError) { return next(lookupError); }
    }
    next(error);
  }
};

export const listMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    if (!validId(conversationId)) return res.status(400).json({ error: "Invalid conversation" });
    const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user.userId });
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 }).limit(500).populate("sender", "name profileImage").lean();
    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
    if (!validId(conversationId)) return res.status(400).json({ error: "Invalid conversation" });
    if (!content || content.length > 4000) return res.status(400).json({ error: "Message must be between 1 and 4000 characters" });
    const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user.userId });
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    const message = await Message.create({ conversation: conversation._id, sender: req.user.userId, content });
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();
    await message.populate("sender", "name profileImage");
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};
