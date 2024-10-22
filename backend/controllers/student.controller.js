import Student from "../models/student.model.js";
import mongoose from "mongoose";

export const getStudents = async (req, res) => {
    try {
        const students = await Student.find({});
        res.status(200).json({success: true, data: students});
    } catch (error) {
        console.log("error in fetching students: ", error.message);
        res.status(500).json({success: false, message: "Server Error"});
    }
}

export const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        res.status(200).json({ success: true, data: student });
    } catch (error) {
        console.error("Error fetching student:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const getStudentByName = async (req, res) => {
    console.log("getStudentByName function called");
  console.log("Request query:", req.query);
  try {
    const { name } = req.query;
    console.log("Searching for student with name:", name);
    
    const student = await Student.findOne({ name: name });
    
    if (student) {
      console.log("Found student:", student);
      res.status(200).json({ success: true, data: [student] });
    } else {
      console.log("No student found with name:", name);
      res.status(404).json({ success: false, message: "Student not found" });
    }
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

export const createStudent = async (req, res) => {
    const student = req.body; //user will send this data

    if (
        student.name === undefined || student.name === null || student.name === '' ||
        student.isAthlete === undefined || student.isAthlete === null
    ) {
        return res.status(400).json({ success: false, message: "Please fill in all fields" });
    }

    const newStudent = new Student(student);

    try {
        await newStudent.save();
        res.status(201).json({success: true, data: newStudent});
    } catch (error) {
        console.error("Error in Create Student: ", error.message);
        res.status(500).json({success: false, message: "Server Error"});
    }

}

