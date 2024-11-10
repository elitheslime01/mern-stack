import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    studentID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Student',
    },
    scheduleID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Schedule',
    },
    timeIn: { type: String, required: true },
    timeOut: { type: String, required: true }
}, {
    timestamps: true,
    unique: true // Ensure unique bookings based on studentID and scheduleID
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;