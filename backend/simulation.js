// simulate.js

import mongoose from 'mongoose';
import Student from './models/student.model.js';
import Schedule from './models/schedule.model.js';
import Queue from './models/queue.model.js';
import Booking from './models/booking.model.js';
import { allocateSlot } from './controllers/queue.controller.js'; // Ensure allocateSlot is exported correctly

// Configuration
const MONGO_URI = "mongodb+srv://admin:admin123@cluster0.w52a1.mongodb.net/gymbooking?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your MongoDB URI
const SCHEDULE_DATE = '2024-12-01'; // Example schedule date
const TIME_SLOTS = [
    { schedDate: SCHEDULE_DATE, schedTime: '8 am - 10 am', availableSlot: 15, schedAvailability: 'Available' },
    { schedDate: SCHEDULE_DATE, schedTime: '10 am - 12 pm', availableSlot: 15, schedAvailability: 'Available' },
    { schedDate: SCHEDULE_DATE, schedTime: '12 pm - 2 pm', availableSlot: 15, schedAvailability: 'Available' },
    { schedDate: SCHEDULE_DATE, schedTime: '2 pm - 4 pm', availableSlot: 15, schedAvailability: 'Available' },
];

// Utility function to generate random integers
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Initialize Students
const initializeStudents = async () => {
    const students = [];
    for (let i = 1; i <= 100; i++) { // Creating 100 students for better simulation
        students.push({
            name: `Student_${i}`,
            isAthlete: i % 3 === 0, // Every 3rd student is an athlete
            // isAthlete: Math.random() < 0.5; // 50% chance of being an athlete
            unsuccessfulAttempts: getRandomInt(0, 3),
            noShows: getRandomInt(0, 2),
            attendedSlots: getRandomInt(0, 5),
        });
    }
    await Student.insertMany(students);
    console.log('Initialized Students');
};

// Initialize Schedules
const initializeSchedules = async () => {
    await Schedule.insertMany(TIME_SLOTS);
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

// Simulate Booking Requests
const simulateBookingRequests = async () => {
    const students = await Student.find({});
    const schedules = await Schedule.find({ schedDate: SCHEDULE_DATE });

    for (const schedule of schedules) {
        const selectedStudents = students.slice(0, 15);
        for (const student of selectedStudents) {
            const delay = getRandomInt(100, 1000);
            setTimeout(async () => {
                try {
                    const queue = await Queue.findOne({ scheduleID: schedule._id });
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
                    console.log(`Student ${student.name} queued for ${schedule.schedTime}`);
                } catch (error) {
                    console.error(`Error queuing student ${student.name}:`, error.message);
                }
            }, delay);
        }
    }
};


// Allocate Slots
const performAllocation = async () => {
    const queues = await Queue.find({}).populate('scheduleID');

    for (const queue of queues) {
        console.log(`Allocating slots for schedule: ${queue.scheduleID.schedTime}`);
        await allocateSlot({ params: { queueId: queue._id.toString() } }, {
            status: (code) => ({
                json: (data) => {
                    console.log(`Allocation Status for ${queue.scheduleID.schedTime}:`, data.message);
                }
            })
        });
    }
};

// Verify Bookings and Queues
const verifyResults = async () => {
    const bookings = await Booking.find({ schedDate: SCHEDULE_DATE }).populate('studentID scheduleID');
    const queues = await Queue.find({}).populate('scheduleID');

    console.log('\n=== Bookings ===');
    bookings.forEach(booking => {
        console.log(`Booking ID: ${booking._id}`);
        console.log(`Student: ${booking.studentID.name}`);
        console.log(`Schedule: ${booking.scheduleID.schedTime}`);
        console.log(`Time In: ${booking.timeIn}`);
        console.log(`Time Out: ${booking.timeOut}`);
        console.log('---------------------------');
    });

    console.log('\n=== Queues ===');
    queues.forEach(queue => {
        console.log(`Schedule: ${queue.scheduleID.schedTime}`);
        console.log('Athletes in Queue:');
        queue.queueAthletes.forEach(a => console.log(` - ${a.studentID.name}`));
        console.log('Ordinary Students in Queue:');
        queue.queueOrdinaryStudents.forEach(o => console.log(` - ${o.studentID.name}`));
        console.log('---------------------------');
    });
};

// Main Simulation Function
const runSimulation = async () => {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // Optional: Clear existing data for a clean simulation
        await Student.deleteMany({});
        await Schedule.deleteMany({});
        await Queue.deleteMany({});
        await Booking.deleteMany({});

        await initializeStudents();
        await initializeSchedules();
        await initializeQueues();
        await simulateBookingRequests();
        await performAllocation();
        await verifyResults();

        mongoose.connection.close();
        console.log('Simulation completed and MongoDB connection closed.');
    } catch (error) {
        console.error('Error during simulation:', error.message);
        mongoose.connection.close();
    }
};

// Execute the simulation
runSimulation();
