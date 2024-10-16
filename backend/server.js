import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import schedulesRoutes from "./routes/schedule.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
});

app.use("/api/schedules", schedulesRoutes)