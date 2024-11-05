import mongoose from "mongoose";

// models/queue.model.js
const studentQueueSchema = new mongoose.Schema({
  studentID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Student'
  },
  name: {
    type: String,
    required: true
  },
  enqueueTime: {
      type: Number,
      default: Date.now
  },
  basePriority: {
      type: Number,
      default: 0  // Default priority for regular students
  },
  isAthlete: {
      type: Boolean,
      required: true
  }
}, {
  timestamps: true
});

const queueSchema = new mongoose.Schema({
  scheduleID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Schedule'
  },
  queueAthletes: [studentQueueSchema],
  queueOrdinaryStudents: [studentQueueSchema]
}, {
  timestamps: true
});

// Calculate priority based on waiting time and student type
queueSchema.methods.calculatePriority = function(student) {
  const waitingTime = (Date.now() - student.enqueueTime) / 1000 / 60; // Convert to minutes
  const basePriority = student.isAthlete ? 30 : 0; // Athletes get higher base priority
  return basePriority + waitingTime; // Priority increases with waiting time
};

// Get all students sorted by priority
queueSchema.methods.getPrioritizedStudents = function() {
  const allStudents = [
      ...this.queueAthletes.map(s => ({...s.toObject(), isAthlete: true})),
      ...this.queueOrdinaryStudents.map(s => ({...s.toObject(), isAthlete: false}))
  ];

  return allStudents.sort((a, b) => {
      const priorityA = this.calculatePriority(a);
      const priorityB = this.calculatePriority(b);
      return priorityB - priorityA;
  });
};

const Queue = mongoose.model('Queue', queueSchema);
export default Queue;