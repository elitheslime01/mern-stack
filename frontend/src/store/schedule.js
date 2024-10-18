import {create} from "zustand"

export const useScheduleStore = create((set) => ({
    schedules: [],
    setSchedule: (schedules) => set({ schedules }),
    createSchedule: async (newSchedule) => {
        console.log("Received schedule:", newSchedule); // Debug log
        if (!newSchedule.schedDate || !newSchedule.schedTime || !newSchedule.availableSlot || !newSchedule.schedAvailability) {
            console.log("Validation failed. Missing fields.");
            return {success: false, message: "Please fill in all fields."}
        }
        try {
            const res = await fetch('http://localhost:5173/api/schedules', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newSchedule)
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error('Server error:', errorData);
                return {success: false, message: errorData.message || "Failed to create schedule"}
            }
            const data = await res.json();
            set((state) => ({schedules: [...state.schedules, data.data]}))
            return {success: true, message: "Schedule created successfully"}
        } catch (error) {
            console.error('Error creating schedule:', error);
            return {success: false, message: "An error occurred while creating the schedule"}
        }
    }
}))