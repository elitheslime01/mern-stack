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

// controllers/queue.controller.js
export const allocateSlot = async (req, res) => {
    const { queueId } = req.params;

    try {
        // Find queue and schedule
        const queue = await Queue.findById(queueId).populate('scheduleID');
        if (!queue) {
            return res.status(404).json({ success: false, message: "Queue not found" });
        }

        const schedule = await Schedule.findById(queue.scheduleID._id);
        if (schedule.availableSlot <= 0) {
            return res.status(400).json({ success: false, message: "No available slots" });
        }

        const dequeuedStudents = [];

        // Allocate slots based on priority
        while (schedule.availableSlot > 0) {
            const prioritizedStudents = queue.getPrioritizedStudents();
            if (prioritizedStudents.length === 0) break;

            const student = prioritizedStudents[0];

            // Create booking
            const newBooking = new Booking({
                studentID: student.studentID,
                scheduleID: schedule._id,
                timeIn: "--",
                timeOut: "--"
            });
            await newBooking.save();

            // Remove student from appropriate queue
            if (student.isAthlete) {
                queue.queueAthletes = queue.queueAthletes.filter(
                    s => !s.studentID.equals(student.studentID)
                );
            } else {
                queue.queueOrdinaryStudents = queue.queueOrdinaryStudents.filter(
                    s => !s.studentID.equals(student.studentID)
                );
            }

            schedule.availableSlot -= 1;
            dequeuedStudents.push(student);
        }

        if (schedule.availableSlot === 0) {
            schedule.schedAvailability = "Unavailable";
        }

        // Save changes
        await queue.save();
        await schedule.save();

        res.status(200).json({
            success: true,
            message: "Slots allocated successfully",
            data: {
                dequeuedStudents,
                updatedQueue: queue,
                updatedSchedule: schedule
            }
        });

    } catch (error) {
        console.error("Error in allocateSlot: ", error.message);
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