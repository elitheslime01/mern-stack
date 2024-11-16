import mongoose from "mongoose";

const bookedStudentSchema = new mongoose.Schema({
    studentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Reference to the Student model
        required: true
    },
    timeIn: {
        type: String, // You can also use Date if you prefer to store as a date
        required: true
    },
    timeOut: {
        type: String, // You can also use Date if you prefer to store as a date
        required: true
    }
}, { _id: false }); // Disable automatic ID generation for this sub-document

const bookingSchema = new mongoose.Schema({
    scheduleID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Schedule' // Reference to the Schedule model
    },
    bookedStudents: [bookedStudentSchema] // Use the sub-document schema here
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});

// Create the Booking model
const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;