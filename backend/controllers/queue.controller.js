import Queue from "../models/queue.model.js";
import Booking from "../models/booking.model.js";
import Schedule from "../models/schedule.model.js";
import Student from "../models/student.model.js";
import mongoose from "mongoose";

export const getQueues = async (req, res) => {
    try {
        const queues = await Queue.find({}).populate('scheduleID');
        res.status(200).json({success: true, data: queues});
    } catch (error) {
        console.log("error in fetching queues: ", error.message);
        res.status(500).json({success: false, message: "Server Error"});
    }
}

export const createQueue = async (req, res) => {
    const { scheduleID, studentID } = req.body;

    // Check if scheduleID and studentID are provided
    if (!scheduleID || !studentID) {
        return res.status(400).json({ success: false, message: "Please provide scheduleID and studentID" });
    }

    try {
        // Validate student ID
        if (!mongoose.Types.ObjectId.isValid(studentID)) {
            return res.status(400).json({ success: false, message: `Invalid student ID: ${studentID}` });
        }

        // Fetch the student to get their isAthlete status
        const student = await Student.findById(studentID);
        if (!student) {
            return res.status(404).json({ success: false, message: `Student not found for ID: ${studentID}` });
        }

        // Create a new queue instance
        const newQueue = new Queue({ scheduleID });

        // Set base priority based on isAthlete status
        const basePriority = student.isAthlete ? 60 : 0;

        const newStudentInQueue = {
            studentID: student._id,
            name: student.name,
            enqueueTime: Date.now(),
            isAthlete: student.isAthlete,
            basePriority: basePriority 
        };
        // Add the student to the appropriate queue
        if (student.isAthlete) {
            newQueue.queueAthletes.push(newStudentInQueue);
        } else {
            newQueue.queueOrdinaryStudents.push(newStudentInQueue);
        }

        // Save the new queue
        await newQueue.save();

        res.status(201).json({
            success: true,
            data: newQueue
        });

    } catch (error) {
        console.error("Error in Create Queue: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// controllers/queue.controller.js
export const allocateSlot = async (req, res) => {
    const { queueId } = req.params; // Extract the queue ID from the request parameters

    try {
        // Find the queue by its ID and populate the associated schedule
        const queue = await Queue.findById(queueId).populate('scheduleID');
        if (!queue) {
            // If the queue is not found, return a 404 error
            return res.status(404).json({ success: false, message: "Queue not found" });
        }

        // Retrieve the schedule associated with the queue
        const schedule = await Schedule.findById(queue.scheduleID._id);
        // Check if there are available slots in the schedule
        if (schedule.availableSlot <= 0) {
            // If no slots are available, return a 400 error
            return res.status(400).json({ success: false, message: "No available slots" });
        }

        const dequeuedStudents = []; // Array to hold students who have been dequeued and allocated slots

        // Allocate slots based on priority
        while (schedule.availableSlot > 0) { // Continue until there are no available slots
            const prioritizedStudents = queue.getPrioritizedStudents(); // Get the list of students in priority order
            if (prioritizedStudents.length === 0) break; // If there are no prioritized students, exit the loop

            const student = prioritizedStudents[0]; // Select the highest priority student

            // Create a new booking for the selected student
            const newBooking = new Booking({
                studentID: student.studentID, // Assign the student's ID to the booking
                scheduleID: schedule._id, // Assign the schedule ID to the booking
                timeIn: "--", // Placeholder for time in
                timeOut: "--" // Placeholder for time out
            });
            await newBooking.save(); // Save the new booking to the database

            // Remove the student from the appropriate queue based on their type
            if (student.isAthlete) {
                // If the student is an athlete, remove them from the athlete queue
                queue.queueAthletes = queue.queueAthletes.filter(
                    s => !s.studentID.equals(student.studentID) // Filter out the dequeued athlete
                );
            } else {
                // If the student is an ordinary student, remove them from the ordinary student queue
                queue.queueOrdinaryStudents = queue.queueOrdinaryStudents.filter(
                    s => !s.studentID.equals(student.studentID) // Filter out the dequeued ordinary student
                );
            }

            schedule.availableSlot -= 1; // Decrement the number of available slots in the schedule
            dequeuedStudents.push(student); // Add the dequeued student to the list
        }

        // If no slots are available, update the schedule's availability status
        if (schedule.availableSlot === 0) {
            schedule.schedAvailability = "Unavailable"; // Mark the schedule as unavailable
        }

        // Save the changes made to the queue and schedule
        await queue.save();
        await schedule.save();

        // Respond with a success message and the details of the operation
        res.status(200).json({
            success: true,
            message: "Slots allocated successfully",
            data: {
                dequeuedStudents, // List of students who were allocated slots
                updatedQueue: queue, // The updated queue after allocation
                updatedSchedule: schedule // The updated schedule after allocation
            }
        });

    } catch (error) {
        // Log any errors that occur during the process
        console.error("Error in allocateSlot: ", error.message);
        // Respond with a server error status
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// New function to get queue for a specific schedule
export const getQueueForSchedule = async (req, res) => {
    const { scheduleID } = req.params; // Extract scheduleID from request parameters

    try {
        // Check if the provided scheduleID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(scheduleID)) {
            return res.status(400).json({ success: false, message: "Invalid schedule ID" });
        }

        // Find the queue associated with the given scheduleID
        const queue = await Queue.findOne({ scheduleID }).populate('scheduleID');

        // If no queue is found, return a 404 response
        if (!queue) {
            return res.status(404).json({ success: false, message: "No queue found for this schedule" });
        }

        // Return the found queue with a 200 status
        res.status(200).json({ success: true, data: queue });
    } catch (error) {
        // Log the error and return a 500 response
        console.error("Error in getQueueForSchedule: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const advanceTime = async (req, res) => {
    const { queueId } = req.params;
    const { minutes } = req.body;

    try {
        const queue = await Queue.findById(queueId);
        if (!queue) {
            return res.status(404).json({ success: false, message: "Queue not found" });
        }

        const advanceMs = minutes * 60 * 1000;
        queue.queueAthletes.forEach(student => {
            student.enqueueTime -= advanceMs;
        });
        queue.queueOrdinaryStudents.forEach(student => {
            student.enqueueTime -= advanceMs;
        });

        await queue.save();

        res.status(200).json({ success: true, message: "Queue time advanced successfully" });
    } catch (error) {
        console.error("Error in advanceTime: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const addStudentToQueue = async (req, res) => {
    const { queueId } = req.params;
    const { studentID } = req.body;

    if (!studentID) {
        return res.status(400).json({ success: false, message: "studentID is required" });
    }

    try {
        // Validate queueId
        if (!mongoose.Types.ObjectId.isValid(queueId)) {
            return res.status(400).json({ success: false, message: "Invalid queue ID" });
        }

        const queue = await Queue.findById(queueId);
        if (!queue) {
            return res.status(404).json({ success: false, message: "Queue not found" });
        }

        // Fetch the student to get their isAthlete status
        const student = await Student.findById(studentID);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Set base priority based on isAthlete status
        const basePriority = student.isAthlete ? 60 : 0;

        const newStudentInQueue = {
            studentID: student._id,
            name: student.name,
            enqueueTime: Date.now(),
            isAthlete: student.isAthlete,
            basePriority: basePriority 
        };

        // Add the student to the appropriate queue
        if (student.isAthlete) {
            queue.queueAthletes.push(newStudentInQueue);
        } else {
            queue.queueOrdinaryStudents.push(newStudentInQueue);
        }

        await queue.save();

        res.status(200).json({
            success: true,
            message: "Student added to queue successfully",
            data: {
                addedStudent: newStudentInQueue,
                queueId: queue._id
            }
        });

    } catch (error) {
        console.error("Error in addStudentToQueue: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};