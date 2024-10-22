import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import schedulesRoutes from "./routes/schedule.route.js";
import bookingsRoutes from "./routes/booking.route.js";
import studentsRoutes from "./routes/student.route.js";
import queuesRoutes from "./routes/queue.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
});

app.use("/api/schedules", schedulesRoutes)
app.use("/api/bookings", bookingsRoutes)
app.use("/api/students", studentsRoutes)
app.use("/api/queues", queuesRoutes)