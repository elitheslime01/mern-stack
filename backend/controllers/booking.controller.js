import Booking from "../models/booking.model.js";
import mongoose from "mongoose";

// Get all bookings
export const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate({
                path: 'studentID',
                select: 'name isAthlete unsuccessfulAttempts',
                strictPopulate: false, // Add this line to allow populating non-schema fields
            });

        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        console.log("Error in fetching bookings: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createBooking = async (req, res) => {
    const { scheduleID, bookedStudents } = req.body;

    if (!scheduleID || !bookedStudents || !Array.isArray(bookedStudents) || bookedStudents.length === 0) {
        return res.status(400).json({ success: false, message: "Please provide a valid scheduleID and an array of booked students" });
    }

    try {
        const newBooking = new Booking({ scheduleID, bookedStudents });
        await newBooking.save(); // Make sure to save the new booking

        return { success: true, data: newBooking }; // Return the new booking object
    } catch (error) {
        console.error("Error creating booking:", error.message);
        return { success: false, message: "Internal server error." }; // Return an error response
    }
};

export const addStudentsToExistingBooking = async (scheduleID, bookedStudents) => {
    try {
        // Check if a booking already exists for the given scheduleID
        const existingBooking = await Booking.findOne({ scheduleID });

        if (existingBooking) {
            // If a booking exists, update it by adding the new students
            existingBooking.bookedStudents.push(...bookedStudents); // Add new students to the existing booking
            await existingBooking.save(); // Save the updated booking

            return { success: true, data: existingBooking, message: "Added students to existing booking." };
        }

        return { success: false, message: "No existing booking found for the given scheduleID." };
    } catch (error) {
        console.error("Error adding students to existing booking:", error.message);
        return { success: false, message: "Internal server error." };
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