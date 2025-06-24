// Dashboard tab data and logic
export const dashboardData = {
  // Dashboard-specific state and functions would go here
  getWelcomeMessage: (doctorName) => `Welcome back, ${doctorName}`,
  getSubtitle: () => "Here's an overview of your teaching activities",

  // Dashboard stats calculations
  getActiveCoursesCount: (courses) => courses.filter((c) => c.status === "Active").length,
  getTotalStudentsCount: (students) => students.length,
  getAverageAttendance: (attendanceStats) => attendanceStats.averageAttendance || 0,
  getTodayClassesCount: (schedule) => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
    return schedule.filter((s) => s.day === today).length
  },

  // Get today's schedule
  getTodaySchedule: (schedule) => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
    return schedule.filter((session) => session.day === today)
  },
}
