import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isAthlete: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
})

const Student = mongoose.model("Student", studentSchema)

export default Student