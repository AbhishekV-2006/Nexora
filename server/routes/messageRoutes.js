import express from "express";
import authenticateToken from "../middleware/authMiddleware.js";
import { listConversations, listMessages, sendMessage, startConversation } from "../controllers/messageController.js";

const router = express.Router();
router.use(authenticateToken);
router.get("/", listConversations);
router.post("/", startConversation);
router.get("/:conversationId", listMessages);
router.post("/:conversationId", sendMessage);

export default router;
