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
    ref: 'Schedule'
  },
  queueAthletes: [studentQueueSchema],  // Use the sub-schema for athletes
  queueOrdinaryStudents: [studentQueueSchema]  // Use the sub-schema for ordinary students
}, {
  timestamps: true  // This adds createdAt and updatedAt for the overall queue document
});

// Create the Queue model
const Queue = mongoose.model('Queue', queueSchema);

// Export the Queue model
export default Queue;