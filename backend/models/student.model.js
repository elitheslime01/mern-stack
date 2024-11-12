import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    isAthlete: {
        type: Boolean,
        required: true,
        default: false,
    },
    unsuccessfulAttempts: {
        type: Number,
        default: 0,
    },
    noShows: {
        type: Number,
        default: 0, 
    },
    attendedSlots: {
        type: Number,
        default: 0, 
    }
}, {
    timestamps: true,
});

// Create the Student model
const Student = mongoose.model('Student', studentSchema);

// Export the Student model
export default Student;