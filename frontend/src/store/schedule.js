import {create} from "zustand"

export const useScheduleStore = create((set) => ({
    schedules: [],
    setSchedule: (schedules) => set({ schedules }),
    createSchedule: async (newSchedule) => {
        if (!newSchedule.schedDate || !newSchedule.schedTime || !newSchedule.availableSlot || !newSchedule.schedAvailability) {
            console.log("Validation failed. Missing fields.");
            return {success: false, message: "Please fill in all fields."}
        }
        try {
            const res = await fetch('/api/schedules', {
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
    },
    fetchSchedules: async () => {
        try {
            const res = await fetch('/api/schedules');
            if (!res.ok) {
                const errorData = await res.json();
                console.error('Server error:', errorData);
                return {success: false, message: errorData.message || "Failed to fetch schedule"}
            }
            const data = await res.json();
            set({schedules: data.data})
            return {success: true, message: "Schedule fetch successfully"}
        } catch (error) {
            console.error('Error fetching schedule:', error);
            return {success: false, message: "An error occurred while fetching the schedule"}
        }
    },
    deleteSchedule: async (sid) => {
        try {
            const res = await fetch('/api/schedules/'+sid, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error('Server error:', errorData);
                return {success: false, message: errorData.message || "Failed to delete schedule"}
            }
            const data = await res.json();
            if (!data.success) {
                return {success: false, message: data.message }
            }
            set((state) => ({schedules: state.schedules.filter(schedule => schedule.id !== sid) }));
        } catch (error) {
            console.error('Error fetching schedule:', error);
            return {success: false, message: "An error occurred while deleting the schedule"}
        }
    }
}))