import Queue from "../models/queue.model.js";
import Booking from "../models/booking.model.js";
import Schedule from "../models/schedule.model.js";
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
    const { scheduleID, queueAthletes, queueOrdinaryStudents } = req.body;

    if (!scheduleID || !queueAthletes || !queueOrdinaryStudents) {
        return res.status(400).json({ success: false, message: "Please provide scheduleID, queueAthletes, and queueOrdinaryStudents" });
    }

    const newQueue = new Queue({
        scheduleID,
        queueAthletes: queueAthletes.map(athlete => ({ studentID: athlete.studentID })),
        queueOrdinaryStudents: queueOrdinaryStudents.map(student => ({ studentID: student.studentID }))
    });

    try {
        await newQueue.save();
        res.status(201).json({ success: true, data: newQueue });
    } catch (error) {
        console.error("Error in Create Queue: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const dequeueStudent = async (req, res) => {
    // Extracting the queueId from the request parameters
    const { queueId } = req.params;

    try {
        // Finding the queue by its ID and populating the associated scheduleID
        const queue = await Queue.findById(queueId).populate('scheduleID');

        // If the queue is not found, return a 404 error
        if (!queue) {
            return res.status(404).json({ success: false, message: "Queue not found" });
        }

        // Finding the schedule associated with the queue
        const schedule = await Schedule.findById(queue.scheduleID._id);

        // Check if there are available slots in the schedule
        if (schedule.availableSlot <= 0) {
            return res.status(400).json({ success: false, message: "No available slots for this schedule" });
        }

        let dequeuedStudent = null;

        // Dequeue a student from the queue; prioritize athletes over ordinary students
        if (queue.queueAthletes.length > 0) {
            dequeuedStudent = queue.queueAthletes.shift(); // Remove the first athlete from the queue
        } else if (queue.queueOrdinaryStudents.length > 0) {
            dequeuedStudent = queue.queueOrdinaryStudents.shift(); // Remove the first ordinary student from the queue
        } else {
            // If both queues are empty, return a 400 error
            return res.status(400).json({ success: false, message: "Queue is empty" });
        }

        // Create a new booking for the dequeued student
        const newBooking = new Booking({
            studentID: dequeuedStudent.studentID, // Set the student ID for the booking
            scheduleID: schedule._id, // Associate the booking with the schedule
            timeIn: "--", // Placeholder for time in
            timeOut: "--" // Placeholder for time out
        });

        // Decrement the available slot in the schedule
        schedule.availableSlot -= 1;

        // If availableSlot reaches 0, update the schedule's availability status
        if (schedule.availableSlot === 0) {
            schedule.schedAvailability = "Unavailable"; // Mark the schedule as unavailable
        }

        // Save the new booking, updated queue, and updated schedule to the database
        await newBooking.save();
        await queue.save();
        await schedule.save();

        // Send a successful response with the dequeued student and updated data
        res.status(200).json({ 
            success: true, 
            message: "Student dequeued and booking created successfully", 
            data: { 
                dequeuedStudent, // The student that was dequeued
                newBooking, // The newly created booking
                updatedQueue: queue, // The updated queue after dequeuing
                updatedSchedule: schedule // The updated schedule after decrementing the slot
            }
        });
    } catch (error) {
        // Log any errors that occur during the process
        console.error("Error in dequeueStudent: ", error.message);
        // Send a 500 error response for server issues
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