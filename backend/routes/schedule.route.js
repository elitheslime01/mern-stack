import express from "express";
import mongoose from "mongoose";
import Schedule from "../models/schedule.model.js";
import { deleteSchedule, getSchedules, updateSchedule, createSchedule } from "../controllers/schedule.controller.js";

const router = express.Router();

router.get("/", getSchedules);

router.post("/", createSchedule);

router.patch("/:id", updateSchedule);

router.delete("/:id", deleteSchedule);

const schedulesRoutes = router;

export default schedulesRoutes;