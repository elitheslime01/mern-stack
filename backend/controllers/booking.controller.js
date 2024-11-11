import Booking from "../models/booking.model.js";
import mongoose from "mongoose";

export const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('studentID', 'name') // Populate student name
            .populate('scheduleID', 'schedDate schedTime'); // Populate schedule details
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        console.log("Error in fetching bookings: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const createBooking = async (req, res) => {
    const { studentID, scheduleID, timeIn, timeOut } = req.body;

    // Validate input
    if (!studentID || !scheduleID || !timeIn || !timeOut) {
        return res.status(400).json({ success: false, message: "Please fill in all fields" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if a booking already exists for the given studentID and scheduleID
        const existingBooking = await Booking.findOne({ studentID, scheduleID }).session(session);
        if (existingBooking) {
            // If a booking exists, return it with a success message
            return res.status(200).json({ success: true, data: existingBooking, message: "Returning existing booking for this student and schedule." });
        }

        // Find the schedule and check available slots
        const schedule = await Schedule.findById(scheduleID).session(session);
        if (!schedule || schedule.availableSlot <= 0) {
            throw new Error("No available slots for this schedule.");
        }

        // Create a new booking
        const newBooking = new Booking({ studentID, scheduleID, timeIn, timeOut });
        await newBooking.save({ session });

        // Update the schedule's available slots
        schedule.availableSlot -= 1;
        await schedule.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        res.status(201).json({ success: true, data: newBooking });
    } catch (error) {
        // Abort the transaction in case of error
        await session.abortTransaction();
        console.error("Error creating booking:", error.message);
        res.status(500).json({ success: false, message: error.message || "Internal server error." });
    } finally {
        // End the session
        session.endSession();
    }
};

export const updateBooking = async (req, res) => {
    const { id } = req.params;
    const bookingUpdate = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Booking ID" }); 
    }

    try {
        const updatedBooking = await Booking.findByIdAndUpdate(id, bookingUpdate, {
            new: true,
        });

        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: "Booking Not Found" });
        }

        res.status(200).json({ success: true, data: updatedBooking });
    } catch (error) {
        console.error("Error in Update Booking: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const deleteBooking = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Booking ID" }); 
    }

    try {
        await Booking.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Booking Deleted" })
    } catch (error) {
        console.error("Error in Delete Booking: ", error.message);
        res.status(404).json({ success: false, message: "Booking Not Found" });
    }
}