import { create } from 'zustand';

export const useStudentStore = create((set) => ({
  student: null,
  isLoggedIn: false,
  isLoading: false,
  loginStudent: async (studentName) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/students/?name=${encodeURIComponent(studentName)}`);
      const data = await response.json();
      console.log("API Response:", data);
      if (data.success && data.data.length === 1) {
        set({ student: data.data[0], isLoggedIn: true });
        return { success: true, message: `Logged in successfully as ${data.data[0].name}` };
      } else if (data.success && data.data.length > 1) {
        return { success: false, message: "Multiple students found with this name. Please use a more specific name." };
      } else {
        return { success: false, message: "Unable to login. Student name does not exist in the database." };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: "An error occurred while logging in" };
    } finally {
      set({ isLoading: false });
    }
  },
  logoutStudent: () => set({ student: null, isLoggedIn: false }),
}));