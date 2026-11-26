import express from "express";
import authenticateToken from "../middleware/authMiddleware.js";
import { acceptOffer, createOffer, listJobOffers, listMyOffers, rejectOffer } from "../controllers/offerController.js";

const router = express.Router();
router.use(authenticateToken);
router.get("/mine", listMyOffers);
router.get("/job/:jobId", listJobOffers);
router.post("/job/:jobId", createOffer);
router.post("/job/:jobId/:offerId/accept", acceptOffer);
router.post("/job/:jobId/:offerId/reject", rejectOffer);

export default router;
