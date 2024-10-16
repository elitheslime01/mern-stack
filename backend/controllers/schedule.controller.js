import Schedule from "../models/schedule.model.js";
import mongoose from "mongoose";

export const getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find({});
        res.status(200).json({success: true, data: schedules});
    } catch (error) {
        console.log("error in fetching schedules: ", error.message);
        res.status(500).json({success: false, message: "Server Error"});
    }
}

export const createSchedule = async (req, res) => {
    const schedule = req.body; //user will send this data

    if (!schedule.schedDate || !schedule.schedTime || !schedule.availableSlot || !schedule.schedAvailability) {
        return res.status(400).json({ success:flase, message: "Please fill in all fields" });
    }

    const newSchedule = new Schedule(schedule);

    try {
        await newSchedule.save();
        res.status(201).json({success: true, data: newSchedule});
    } catch (error) {
        console.error("Error in Create Schedule: ", error.message);
        res.status(500).json({success: false, message: "Server Error"});
    }

}

export const updateSchedule = async (req, res) => {
    const { id } = req.params;
    const scheduleUpdate = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Schedule ID" }); 
    }
  
    try {
      const updatedSchedule = await Schedule.findByIdAndUpdate(id, scheduleUpdate, {
        new: true,
      });
  
      if (!updatedSchedule) {
        return res.status(404).json({ success: false, message: "Schedule Not Found" });
      }
  
      res.status(200).json({ success: true, data: updatedSchedule });
    } catch (error) {
      console.error("Error in Update Schedule: ", error.message);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }

  export const deleteSchedule = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Schedule ID" }); 
    }

    try {
        await Schedule.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Schedule Deleted"})
    } catch (error) {
        console.error("Error in Delete Schedule: ", error.message);
        res.status(404).json({success: false, message: "Schedule Not Found"});
    }
}