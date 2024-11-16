import express from "express";
import { 
    createQueue,
    getQueues, 
    getQueueForSchedule, 
    allocateSlot,
    addStudentToQueue
} from "../controllers/queue.controller.js";

const router = express.Router();

// Get all queues
router.get("/", getQueues);

// Create a new queue
router.post("/", createQueue);

// Dequeue a student from a specific queue
router.patch('/:queueId/allocateSlots', allocateSlot);

// Get queue for a specific schedule
router.get('/schedule/:scheduleID', getQueueForSchedule);

// Add student for the queue
router.patch('/:queueId/addStudent', addStudentToQueue);


const queuesRoutes = router;

export default queuesRoutes;