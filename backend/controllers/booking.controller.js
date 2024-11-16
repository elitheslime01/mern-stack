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
    const { scheduleID, bookedStudents } = req.body; // bookedStudents is now an array of objects

    // Validate input
    if (!scheduleID || !bookedStudents || !Array.isArray(bookedStudents) || bookedStudents.length === 0) {
        return res.status(400).json({ success: false, message: "Please provide a valid scheduleID and an array of booked students" });
    }

    try {
        // Check if a booking already exists for the given scheduleID
        const addStudentsResult = await addStudentsToExistingBooking(scheduleID, bookedStudents);

        if (addStudentsResult.success) {
            // If students were added to an existing booking, return the updated booking
            return res.status(200).json(addStudentsResult);
        }

        // Create a new booking if no existing booking is found
        const newBooking = new Booking({ scheduleID, bookedStudents });
        await newBooking.save();

        res.status(201).json({ success: true, data: newBooking });
    } catch (error) {
        console.error("Error creating booking:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
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