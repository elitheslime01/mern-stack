import Queue from "../models/queue.model.js";
import Student from "../models/student.model.js";
import Schedule from "../models/schedule.model.js";
import Booking from "../models/booking.model.js";
import { createBooking } from "../controllers/booking.controller.js"; // Add this line
import BSTPriorityQueue from "../utils/bst_PriorityQueue.js"; // Ensure this is imported
import mongoose from "mongoose";

// Get all queues
export const getQueues = async (req, res) => {
    try {
        const queues = await Queue.find({})
            .populate({
                path: 'queueAthletes.studentID',
                select: 'name isAthlete unsuccessfulAttempts noShows attendedSlots' // Select the fields to populate
            })
            .populate({
                path: 'queueOrdinaryStudents.studentID',
                select: 'name isAthlete unsuccessfulAttempts noShows attendedSlots' // Select the fields to populate
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
                select: 'name isAthlete unsuccessfulAttempts', // Select the fields to populate
                strictPopulate: false // Add this line to allow populating non-schema fields
            })
            .populate({
                path: 'queueOrdinaryStudents.studentID',
                select: 'name isAthlete unsuccessfulAttempts', // Select the fields to populate
                strictPopulate: false // Add this line to allow populating non-schema fields
            });

        // ... Rest of the function
    } catch (error) {
        // ... Rest of the error handling
    }
}

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
                bstPriorityQueue.insert({
                    ...student.toObject(),
                    unsuccessfulAttempts: athlete.unsuccessfulAttempts,
                    attendedSlots: student.attendedSlots,
                    noShows: student.noShows,
                    isAthlete: true
                });
            } else {
                console.warn(`Student with ID ${athlete.studentID} not found.`);
            }
        }

        // Insert ordinary students into the BST
        for (const ordinaryStudent of queue.queueOrdinaryStudents) {
            const student = await Student.findById(ordinaryStudent.studentID).session(session);
            if (student) {
                bstPriorityQueue.insert({
                    ...student.toObject(),
                    unsuccessfulAttempts: ordinaryStudent.unsuccessfulAttempts,
                    attendedSlots: student.attendedSlots,
                    noShows: student.noShows,
                    isAthlete: false
                });
            } else {
                console.warn(`Student with ID ${ordinaryStudent.studentID} not found.`);
            }
        }

        const dequeuedStudents = [];

        // Dequeue students until no available slots or no students left
        while (schedule.availableSlot > 0 && !bstPriorityQueue.isEmpty()) {
            const dequeuedStudent = bstPriorityQueue.extractMax(); // Get the student with the highest priority
            console.log(`Dequeued Student ID: ${dequeuedStudent._id}`); // Log the dequeued student ID

            // Prepare booking data
            const bookingData = {
                scheduleID: schedule._id,
                bookedStudents: [{
                    studentID: dequeuedStudent._id,
                    timeIn: "--", // Set appropriate time in
                    timeOut: "--" // Set appropriate time out
                }]
            };
            // Check if a booking already exists for this schedule
            const existingBooking = await Booking.findOne({ scheduleID: schedule._id }).session(session);

            if (existingBooking) {
                // If a booking exists, add the student to the existing booking
                const addStudentResponse = await addStudentsToExistingBooking(schedule._id, bookingData.bookedStudents);

                if (!addStudentResponse.success) {
                    throw new Error(addStudentResponse.message); // Handle error if adding students failed
                }
            } else {
                // If no existing booking, create a new one
                const bookingResponse = await createBooking({ body: bookingData }, { status: (code) => ({ json: (data) => data }) });

                if (!bookingResponse.success) {
                    throw new Error(bookingResponse.message); // Handle error if booking creation failed
                }
            }

            // Continue with the allocation logic
            schedule.availableSlot -= 1;
            // ... (rest of your allocation logic)
            dequeuedStudents.push(dequeuedStudent); // Add dequeued student to the array

            // Reset unsuccessful attempts to 0 for the student who secured a slot
            await Student.updateOne(
                { _id: dequeuedStudent._id },
                { $set: { unsuccessfulAttempts: 0 } },
                { session }
            );

            // Check if the student can reset their noShows count
            if (dequeuedStudent.isAthlete) {
                const targetAttendedSlots = 3;
                const attendedSlotsSinceLastReset = dequeuedStudent.attendedSlots - dequeuedStudent.noShows * 2;

                if (attendedSlotsSinceLastReset >= targetAttendedSlots) {
                    const slotsToReset = Math.floor(attendedSlotsSinceLastReset / targetAttendedSlots);
                    await Student.updateOne(
                    { _id: dequeuedStudent._id },
                    { $inc: { attendedSlots: -slotsToReset * targetAttendedSlots, noShows: -slotsToReset } },
                    { session }
                );
                }
            }

            // Increment the attended slots count
            await Student.updateOne(
                { _id: dequeuedStudent._id },
                { $inc: { attendedSlots: 1 } }, // Increment attended slots
                { session }
            );

            // Update unsuccessful attempts for the dequeued student
            if (dequeuedStudent.isAthlete) {
                await Queue.updateOne(
                    { _id: queueId, "queueAthletes.studentID": dequeuedStudent._id },
                    { $inc: { "queueAthletes.$.unsuccessfulAttempts": 1 } },
                    { session }
                );
            } else {
                await Queue.updateOne(
                    { _id: queueId, "queueOrdinaryStudents.studentID": dequeuedStudent._id },
                    { $inc: { "queueOrdinaryStudents.$.unsuccessfulAttempts": 1 } },
                    { session }
                );
            }

            // Remove the dequeued student from the appropriate queue
            if (dequeuedStudent.isAthlete) {
                await Queue.updateOne(
                    { _id: queueId },
                    { $pull: { queueAthletes: { studentID: dequeuedStudent._id } } },
                    { session }
                );
            } else {
                await Queue.updateOne(
                    { _id: queueId },
                    { $pull: { queueOrdinaryStudents: { studentID: dequeuedStudent._id } } },
                    { session }
                );
            }
        }

        // Save the updated schedule
        await schedule.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        const end = performance.now(); // End timing the allocation
        console.log(`Allocation completed in ${end - start} ms`);

        return res.status(200).json({
            success: true,
            message: "Students dequeued and bookings created successfully",
            data: {
                dequeuedStudents,
                updatedQueue: queue,
                updatedSchedule: schedule
            }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error during allocation:", error);
        return res.status(500).json({ success: false, message: "An error occurred during allocation" });
    }
};

// Example function to calculate average waiting time
const calculateAverageWaitingTime = (students) => {
    if (students.length === 0) return 0;
    const totalWaitingTime = students.reduce((acc, student) => acc + student.waitingTime, 0); // Assuming waitingTime is tracked
    return (totalWaitingTime / students.length).toFixed(4); // Average waiting time
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


export const addStudentToQueue = async (req, res) => {
    const { queueId } = req.params; // Get the queue ID from the request parameters
    const { studentID } = req.body; // Get the student ID from the request body

    const session = await mongoose.startSession(); // Start a new session
    session.startTransaction(); // Begin a transaction

    try {
        // Check if the queue exists
        const queue = await Queue.findById(queueId).session(session);
        if (!queue) {
            return res.status(404).json({ success: false, message: "Queue not found" });
        }

        // Fetch the student to determine their type (athlete or ordinary)
        const student = await Student.findById(studentID).session(session);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Create a new entry for the student in the appropriate queue
        const queueEntry = {
            studentID: student._id,
            unsuccessfulAttempts: student.unsuccessfulAttempts,
            // Other relevant fields can be added here
        };

        // Add to the appropriate queue based on student type
        if (student.isAthlete) {
            queue.queueAthletes.push(queueEntry);
        } else {
            queue.queueOrdinaryStudents.push(queueEntry);
        }

        // Save the updated queue
        await queue.save({ session }); // Save within the session

        // Commit the transaction
        await session.commitTransaction();

        res.status(200).json({ success: true, message: "Student added to queue successfully" });
    } catch (error) {
        // Abort the transaction in case of an error
        await session.abortTransaction();
        console.error("Error adding student to queue:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    } finally {
        // End the session
        session.endSession();
    }
};