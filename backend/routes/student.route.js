import express from "express";
import mongoose from "mongoose";
import Student from "../models/student.model.js";
import { createStudent, getStudents, getStudentById, getStudentByName } from "../controllers/student.controller.js";

const router = express.Router();

router.get("/", getStudents);

router.post("/", createStudent);

router.get("/:id", getStudentById);

router.get('/', getStudentByName);

const studentsRoutes = router;

export default studentsRoutes;