// Attendance tab data and logic
export const attendanceData = {
  // Get attendance stats for selected course
  getCourseAttendanceStats: (attendanceStats, selectedCourse) => {
    return attendanceStats.courseStats?.find((c) => c.courseCode === selectedCourse)
  },

  // Attendance overview metrics
  getAttendanceMetrics: (courseStats) => [
    {
      title: "Average Attendance",
      value: `${courseStats?.averageAttendance || 0}%`,
    },
    {
      title: "Last Session",
      value: `${courseStats?.lastSessionAttendance || 0}%`,
    },
    {
      title: "At Risk Students",
      value: courseStats?.atRiskStudents || 0,
    },
  ],

  // Table columns for attendance sessions
  getSessionTableColumns: () => ["Date", "Time", "Location", "Present", "Absent", "Percentage", "Actions"],

  // Get attendance status class
  getAttendanceStatusClass: (percentage) => (percentage >= 75 ? "success" : "error"),
}
