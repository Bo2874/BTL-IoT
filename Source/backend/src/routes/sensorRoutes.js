import express from "express";
import { getAllData } from "../controllers/sensorController.js";

const router = express.Router();

router.get("/", getAllData);

export default router;
