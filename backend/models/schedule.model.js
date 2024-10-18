import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    schedDate: {
        type: Date,
        required: true
    },
    schedTime: {
        type: String,
        required: true
    },
    availableSlot: {
        type: Number,
        required: true
    },
    schedAvailability: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;