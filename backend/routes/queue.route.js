import express from "express";
import { 
    createQueue,
    getQueues, 
    getQueueForSchedule, 
    allocateSlot
} from "../controllers/queue.controller.js";

const router = express.Router();

// Get all queues
router.get("/", getQueues);

// Create a new queue
router.post("/", createQueue);

// Dequeue a student from a specific queue
router.patch('/:queueId/dequeue', allocateSlot);

// Get queue for a specific schedule
router.get('/schedule/:scheduleID', getQueueForSchedule);

const queuesRoutes = router;

export default queuesRoutes;