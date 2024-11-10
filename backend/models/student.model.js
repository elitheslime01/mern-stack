import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    isAthlete: {
        type: Boolean,
        required: true,
        default: false, // Default value can be set based on your application logic
    },
    unsuccessfulAttempts: {
        type: Number,
        default: 0 // Initialize unsuccessful attempts to 0
    }
}, {
    timestamps: true,
});

// Create the Student model
const Student = mongoose.model('Student', studentSchema);

// Export the Student model
export default Student;