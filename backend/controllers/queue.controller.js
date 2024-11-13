import Queue from "../models/queue.model.js";
import Student from "../models/student.model.js";
import Schedule from "../models/schedule.model.js";
import Booking from "../models/booking.model.js";
import BSTPriorityQueue from "../utils/bst_PriorityQueue.js"; // Ensure this is imported
import mongoose from "mongoose";

// Get all queues
export const getQueues = async (req, res) => {
    try {
        const queues = await Queue.find({})
            .populate({
                path: 'queueAthletes.studentID',
                select: 'name isAthlete unsuccessfulAttempts' // Select the fields to populate
            })
            .populate({
                path: 'queueOrdinaryStudents.studentID',
                select: 'name isAthlete unsuccessfulAttempts' // Select the fields to populate
            });

        res.status(200).json({ success: true, data: queues });
    } catch (error) {
        console.log("Error in fetching queues: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get queue for a specific schedule
export const getQueueForSchedule = async (req, res) => {
    const { scheduleID } = req.params; // Extract scheduleID from request parameters

    try {
        // Check if the provided scheduleID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(scheduleID)) {
            return res.status(400).json({ success: false, message: "Invalid schedule ID" });
        }

        // Find the queue associated with the given scheduleID
        const queue = await Queue.findOne({ scheduleID })
            .populate({
                path: 'queueAthletes.studentID',
                select: 'name isAthlete unsuccessfulAttempts' // Select the fields to populate
            })
            .populate({
                path: 'queueOrdinaryStudents.studentID',
                select: 'name isAthlete unsuccessfulAttempts' // Select the fields to populate
            });

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

// Create a new queue
export const createQueue = async (req, res) => {
    const { scheduleID, queueAthletes, queueOrdinaryStudents } = req.body;

    if (!scheduleID || !queueAthletes || !queueOrdinaryStudents) {
        return res.status(400).json({ success: false, message: "Please provide scheduleID, queueAthletes, and queueOrdinaryStudents" });
    }

    // Check if a queue already exists for the given scheduleID
    const existingQueue = await Queue.findOne({ scheduleID });
    if (existingQueue) {
        return res.status(200).json({ success: true, data: existingQueue, message: "Returning existing queue for this schedule." });
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

// Allocate slots for students in the queue
export const allocateSlot = async (req, res) => {
    const start = performance.now(); // Start timing the allocation

    const { queueId } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const queue = await Queue.findById(queueId)
            .populate('queueAthletes.studentID', 'name isAthlete unsuccessfulAttempts attendedSlots noShows') // Include attendedSlots and noShows
            .populate('queueOrdinaryStudents.studentID', 'name isAthlete unsuccessfulAttempts attendedSlots noShows') // Include attendedSlots and noShows
            .session(session);

        if (!queue) {
            return res.status(404).json({ success: false, message: "Queue not found" });
        }

        const schedule = await Schedule.findById(queue.scheduleID).session(session);
        if (!schedule) {
            throw new Error("Schedule not found.");
        }

        if (schedule.availableSlot <= 0) {
            return res.status(400).json({ success: false, message: "No available slots for this schedule" });
        }

        const bstPriorityQueue = new BSTPriorityQueue(); // Create a new BST priority queue

        // Insert athletes into the BST
        for (const athlete of queue.queueAthletes) {
            const student = await Student.findById(athlete.studentID).session(session);
            if (student) {
                bstPriorityQueue.insert({ ...student.toObject(), unsuccessfulAttempts: athlete.unsuccessfulAttempts, attendedSlots: student.attendedSlots, isAthlete: true });
            } else {
                console.warn(`Student with ID ${athlete.studentID} not found.`);
            }
        }

        // Insert ordinary students into the BST
        for (const ordinaryStudent of queue.queueOrdinaryStudents) {
            const student = await Student.findById(ordinaryStudent.studentID).session(session);
            if (student) {
                bstPriorityQueue.insert({ ...student.toObject(), unsuccessfulAttempts: ordinaryStudent.unsuccessfulAttempts, attendedSlots: student.attendedSlots, isAthlete: false });
            } else {
                console.warn(`Student with ID ${ordinaryStudent.studentID} not found.`);
            }
        }

        const dequeuedStudents = [];

        // Dequeue students until no available slots or no students left
        while (schedule.availableSlot > 0 && !bstPriorityQueue.isEmpty()) {
            const dequeuedStudent = bstPriorityQueue.extractMax(); // Get the student with the highest priority

            // Calculate wait time based on cycleJoined and cycleAllocated
            const cycleAllocated = performance.now();
            const waitTime = cycleAllocated - start;
            console.log(`Wait Time for ${dequeuedStudent.name}: ${waitTime.toFixed(2)} mili-seconds`);

            // Create a new booking for the dequeued student
            const newBooking = new Booking({
                studentID: dequeuedStudent._id,
                scheduleID: schedule._id,
                timeIn: "--",
                timeOut: "--" // This can be set later
            });

            // Decrement the available slot in the schedule
            schedule.availableSlot -= 1;

            // If availableSlot reaches 0, update the schedule's availability status
            if (schedule.availableSlot === 0) {
                schedule.schedAvailability = "Unavailable"; // Mark the schedule as unavailable
            }

            // Save the new booking
            await newBooking.save({ session });
            dequeuedStudents.push(dequeuedStudent); // Add dequeued student to the array

            // Reset unsuccessful attempts to 0 for the student who secured a slot
            await Student.updateOne(
                { _id: dequeuedStudent._id },
                { $set: { unsuccessfulAttempts: 0 } },
                { session }
            );

            // Check if the student can reset their noShows count
            if (dequeuedStudent.attendedSlots >= 2) { // Assuming the threshold is 2
                await Student.updateOne(
                    { _id: dequeuedStudent._id },
                    { $set: { noShows: 0 } }, // Reset noShows count
                    { session }
                );
            }

            // Increment the attended slots count
            await Student.updateOne(
                { _id: dequeuedStudent._id },
                { $inc: { attendedSlots: 1 } }, // Increment attended slots
                { session }
            );

            // Increment the unsuccessful attempts for the dequeued student
            if (dequeuedStudent.isAthlete) {
                await Queue.updateOne(
                    { _id: queueId, "queueAthletes.studentID": dequeuedStudent._id },
                    { $inc: { "queueAthletes.$.unsuccess fulAttempts": 1 } },
                    { session }
                );
            } else {
                await Queue.updateOne(
                    { _id: queueId, "queueOrdinaryStudents.studentID": dequeuedStudent._id },
                    { $inc: { "queueOrdinaryStudents.$.unsuccessfulAttempts": 1 } },
                    { session }
                );
            }
        }

        // If no students were dequeued, return a specific message
        if (dequeuedStudents.length === 0) {
            return res.status(200).json({ success: true, message: "No students were available to dequeue." });
        }

        // Save the updated queue and updated schedule to the database
        await queue.save({ session });
        await schedule.save({ session });

        // Commit the transaction
        await session.commitTransaction();

        // Calculate total allocation time
        const end = performance.now();
        console.log(`Total Allocation Time: ${(end - start).toFixed(4)} ms`);

        // Send a successful response with the dequeued students and updated data
        res.status(200).json({
            success: true,
            message: "Students dequeued and bookings created successfully",
            data: {
                dequeuedStudents,
                updatedQueue: queue,
                updatedSchedule: schedule
            }
        });
    } catch (error) {
        if (error.code === 112) { // Write conflict error code
            console.log('Write conflict detected. Retrying...');
            await allocateSlot(req, res);
        } else {
        throw error;
        }
        await session.abortTransaction();
        console.error("Error allocating slots:", error.message);
        res.status(500).json({ success: false, message: error.message || "Internal server error." });
    } finally {
        session.endSession();
    }
};

// Dequeue a student from the queue
export const dequeueStudent = async (req, res) => {
    const { queueId, studentId } = req.params;

    try {
        const queue = await Queue.findById(queueId);
        if (!queue) {
            return res.status(404).json({ success: false, message: "Queue not found" });
        }

        // Logic to remove the student from the queue
        // This could involve finding the student in either queueAthletes or queueOrdinaryStudents
        // and removing them accordingly.

        res.status(200).json({ success: true, message: "Student dequeued successfully" });
    } catch (error) {
        console.error("Error in dequeueStudent: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};