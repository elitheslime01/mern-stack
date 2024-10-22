import express from "express";
import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import { createBooking, deleteBooking, getBookings, updateBooking } from "../controllers/booking.controller.js";

const router = express.Router();

router.get("/", getBookings);

router.post("/", createBooking);

router.patch("/:id", updateBooking);

router.delete("/:id", deleteBooking);

const bookingsRoutes = router;

export default bookingsRoutes;