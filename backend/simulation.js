// simulation.js

import mongoose from 'mongoose';
import Student from './models/student.model.js';
import Schedule from './models/schedule.model.js';
import Queue from './models/queue.model.js';
import Booking from './models/booking.model.js';
import { createStudent, getStudents } from './controllers/student.controller.js'; 
import { createSchedule, getSchedules } from './controllers/schedule.controller.js'; 
import { createQueue } from './controllers/queue.controller.js'; 
import { createBooking } from './controllers/booking.controller.js'; 
import { addStudentToQueue } from './controllers/queue.controller.js';
import { allocateSlot } from './controllers/queue.controller.js'; 


// Configuration
const MONGO_URI = "mongodb+srv://admin:admin123@cluster0.w52a1.mongodb.net/gymbooking?retryWrites=true&w=majority&appName=Cluster0" ; // Use environment variable for the MongoDB URI
const SCHEDULE_DATE = '2024-12-01'; // Example schedule date
const TIME_SLOTS = [
    { schedDate: SCHEDULE_DATE, schedTime: '8 am - 10 am', availableSlot: 15, schedAvailability: 'Available' },
    { schedDate: SCHEDULE_DATE, schedTime: '10 am - 12 pm', availableSlot: 5, schedAvailability: 'Available' },
    { schedDate: SCHEDULE_DATE, schedTime: '12 pm - 2 pm', availableSlot: 5, schedAvailability: 'Available' },
    { schedDate: SCHEDULE_DATE, schedTime: '2 pm - 4 pm', availableSlot: 5, schedAvailability: 'Available' },
];

// Utility function to generate random integers
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Initialize Students
const initializeStudents = async (numStudents = 120) => {
    const students = Array.from({ length: numStudents }, (_, i) => {
        const isAthlete = (i + 1) % 3 === 0;
        return {
            name: isAthlete ? `Student_Athlete_${i + 1}` : `Student_Ordinary_${i + 1}`,
            isAthlete: isAthlete,
            unsuccessfulAttempts: getRandomInt(0, 6),
            noShows: getRandomInt(0, 2),
            attendedSlots: getRandomInt(0, 6),
        };
    });

    // Create students using the controller
    for (const student of students) {
        await createStudent({ body: student }, { status: () => ({ json: () => {} }) });
    }
    console.log('Initialized Students');
};

// Initialize Schedules
const initializeSchedules = async () => {
    for (const timeSlot of TIME_SLOTS) {
        await createSchedule({ body: timeSlot }, { status: () => ({ json: () => {} }) });
    }
    console.log('Initialized Schedules');
};

// Initialize Queues
const initializeQueues = async () => {
    const schedules = await Schedule.find({});
    for (const schedule of schedules) {
        const queue = new Queue({
            scheduleID: schedule._id,
            queueAthletes: [],
            queueOrdinaryStudents: [],
        });
        await queue.save();
    }
    console.log('Initialized Queues');
};

// const initializeQueues = async () => {
//     const schedules = await getSchedules();
//     const queuePromises = schedules.data.map(schedule => {
//         const queueData = {
//             scheduleID: schedule._id,
//             queueAthletes: [],
//             queueOrdinaryStudents: [],
//         };
//         return createQueue({ body: queueData }, { status: () => ({ json: () => {} }) });
//     });
//     await Promise.all(queuePromises);
//     console.log('Initialized Queues');
// };

// Simulate Booking Requests
const simulateBookingRequests = async () => {
    const students = await Student.find({});
    const schedules = await Schedule.find({ schedDate: SCHEDULE_DATE });

    // Specify the target time slot (for example, the first time slot)
    const targetTimeSlot = TIME_SLOTS[0]; // Change the index as needed

    // Find the corresponding schedule for the target time slot
    const targetSchedule = schedules.find(schedule => schedule.schedTime === targetTimeSlot.schedTime);

    if (!targetSchedule) {
        console.error(`No schedule found for the target time slot: ${targetTimeSlot.schedTime}`);
        return;
    }

    for (const student of students) {
        const delay = getRandomInt(100, 1000);
        setTimeout(async () => {
            try {
                const queue = await Queue.findOne({ scheduleID: targetSchedule._id });
                const cycleJoined = new Date();

                if (student.isAthlete) {
                    queue.queueAthletes.push({
                        studentID: student._id,
                        unsuccessfulAttempts: student.unsuccessfulAttempts,
                        cycleJoined, // Add timestamp when joining queue
                    });
                } else {
                    queue.queueOrdinaryStudents.push({
                        studentID: student._id,
                        unsuccessfulAttempts: student.unsuccessfulAttempts,
                        cycleJoined, // Add timestamp
                    });
                }

                await queue.save();
                console.log(`Student ${student.name} queued for ${targetSchedule.schedTime}`);
            } catch (error) {
                console.error(`Error queuing student ${student.name}:`, error.message);
            }
        }, delay);
    }
};

// const simulateBookingRequests = async () => {
//     const students = await Student.find({});
//     const schedules = await Schedule.find({ schedDate: SCHEDULE_DATE });

//     for (const schedule of schedules) {
//         const selectedStudents = students.slice(0, 15);
//         for (const student of selectedStudents) {
//             const delay = getRandomInt(100, 1000);
//             setTimeout(async () => {
//                 try {
//                     const queue = await Queue.findOne({ scheduleID: schedule._id });
//                     const cycleJoined = new Date();

//                     if (student.isAthlete) {
//                         queue.queueAthletes.push({
//                             studentID: student._id,
//                             unsuccessfulAttempts: student.unsuccessfulAttempts,
//                             cycleJoined, // Add timestamp when joining queue
//                         });
//                     } else {
//                         queue.queueOrdinaryStudents.push({
//                             studentID: student._id,
//                             unsuccessfulAttempts: student.unsuccessfulAttempts,
//                             cycleJoined, // Add timestamp
//                         });
//                     }

//                     await queue.save();
//                     console.log(`Student ${student.name} queued for ${schedule.schedTime}`);
//                 } catch (error) {
//                     console.error(`Error queuing student ${student.name}:`, error.message);
//                 }
//             }, delay);
//         }
//     }
// };

// const simulateBookingRequests = async () => {
//     const students = await getStudents();
//     const schedules = await getSchedules();

//     for (const schedule of schedules.data) {
//         const selectedStudents = students.data.sort(() => 0.5 - Math.random()).slice(0, 15); // Random selection
//         for (const student of selectedStudents) {
//             const delay = getRandomInt(100, 1000);
//             setTimeout(() => queueStudent(schedule, student), delay);
//         }
//     }
// };

const queueStudent = async (schedule, student) => {
    try {
        // Call the addStudentToQueue controller function
        const response = await addStudentToQueue({ params: { queueId: schedule._id }, body: { studentID: student._id } }, { status: (code) => ({ json: (data) => data }) });

        if (response.success) {
            console.log(`Student ${student.name} queued for ${schedule.schedTime}`);
        } else {
            console.error(`Failed to queue student ${student.name}: ${response.message}`);
        }
    } catch (error) {
        console.error(`Error queuing student ${student.name}:`, error.message);
    }
};

// Allocate Slots
const performAllocation = async () => {
    const queues = await Queue.find({}).populate('scheduleID');

    for (const queue of queues) {
        console.log(`Allocating slots for schedule: ${queue.scheduleID.schedTime}`);
        await allocateSlot({ params: { queueId: queue._id.toString() } }, {
            status: (code) => ({
                json: async (data) => {
                    if (data.success && data.studentID) {
                        console.log(`Allocation successful for ${data.studentID}`);
                        await updateStudentCycleJoined(data.studentID);
                    } else {
                        console.error(`Allocation failed: ${data.message}`);
                    }
                }
            })
        });
    }
};

const updateStudentCycleJoined = async (studentID) => {
    const student = await Student.findById(studentID);
    if (student) {
        student.cycleJoined = new Date();
        await student.save();
    } else {
        console.error(`Student not found with ID ${studentID}`);
    }
};

// // Verify Bookings and Queues
// const verifyResults = async () => {
//     const bookings = await Booking.find({ schedDate: SCHEDULE_DATE }).populate('studentID scheduleID');
//     const queues = await Queue.find({}).populate('scheduleID');

//     console.log('\n=== Bookings ===');
//     bookings.forEach(booking => {
//         console.log(`Booking ID: ${booking._id}`);
//         console.log(`Student: ${booking.studentID.name}`);
//         console.log(`Schedule: ${booking.scheduleID.schedTime}`);
//         console.log(`Time In: ${booking.timeIn}`);
//         console.log(`Time Out: ${booking.timeOut}`);
//         console.log('---------------------------');
//     });

//     console.log('\n=== Queues ===');
//     queues.forEach(queue => {
//         console.log(`Schedule: ${queue.scheduleID.schedTime}`);
//         console.log('Athletes in Queue:');
//         queue.queueAthletes.forEach(a => console.log(` - ${a.studentID.name}`));
//         console.log('Ordinary Students in Queue:');
//         queue.queueOrdinaryStudents.forEach(o => console.log(` - ${o.studentID.name}`));
//         console.log('---------------------------');
//     });
// };

// Main Simulation Function
const runSimulation = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data for a clean simulation
        await Promise.all([
            Student.deleteMany({}),
            Schedule.deleteMany({}),
            Queue.deleteMany({}),
            Booking.deleteMany({})
        ]);

        await initializeStudents();
        await initializeSchedules();
        await initializeQueues();
        await simulateBookingRequests();
        await performAllocation();
        mongoose.connection.close();
        console.log('Simulation completed and MongoDB connection closed.');
    } catch (error) {
        console.error('Error during simulation:', error.message);
        mongoose.connection.close();
    }
};

// Execute the simulation
runSimulation();