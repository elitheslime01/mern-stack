import Booking from "../models/booking.model.js";
import mongoose from "mongoose";

export const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({});
        res.status(200).json({success: true, data: bookings});
    } catch (error) {
        console.log("error in fetching bookings: ", error.message);
        res.status(500).json({success: false, message: "Server Error"});
    }
}

export const createBooking = async (req, res) => {
    const booking = req.body; //user will send this data

    if (
        booking.studentID === undefined || booking.studentID === null || booking.studentID === '' ||
        booking.schedID === undefined || booking.schedID === null || booking.schedID === '' ||
        booking.timeIn === undefined || booking.timeIn === null || booking.timeIn === '' ||
        booking.timeOut === undefined || booking.timeOut === null || booking.timeOut === ''
    ) {
        return res.status(400).json({ success: false, message: "Please fill in all fields" });
    }

    const newBooking = new Booking(booking);

    try {
        await newBooking.save();
        res.status(201).json({success: true, data: newBooking});
    } catch (error) {
        console.error("Error in Create Booking: ", error.message);
        res.status(500).json({success: false, message: "Server Error"});
    }

}

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
        res.status(200).json({ success: true, message: "Booking Deleted"})
    } catch (error) {
        console.error("Error in Delete Booking: ", error.message);
        res.status(404).json({success: false, message: "Booking Not Found"});
    }
}