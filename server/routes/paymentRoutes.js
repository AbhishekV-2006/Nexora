import express from "express";
import authenticateToken from "../middleware/authMiddleware.js";
import { listMyPayments, simulateJobPayment } from "../controllers/paymentController.js";

const router = express.Router();
router.use(authenticateToken);
router.get("/mine", listMyPayments);
router.post("/jobs/:jobId/simulate", simulateJobPayment);

export default router;
