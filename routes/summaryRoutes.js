import express from "express";
import { summarizeController } from "../controllers/summaryController.js";

const router = express.Router();

router.post("/", summarizeController);

export default router;
