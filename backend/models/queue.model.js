import mongoose from "mongoose";

// Define a sub-schema for student entries in the queue
const studentQueueSchema = new mongoose.Schema({
  studentID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Student',
  }
}, {
  timestamps: true  // This adds createdAt and updatedAt for each student entry
});

// Define the main queue schema
const queueSchema = new mongoose.Schema({
  scheduleID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Schedule',
    unique: true // Ensure only one queue per schedule
  },
  queueAthletes: [studentQueueSchema],
  queueOrdinaryStudents: [studentQueueSchema]
}, {
  timestamps: true
});

// Create the Queue model
const Queue = mongoose.model('Queue', queueSchema);

// Export the Queue model
export default Queue;