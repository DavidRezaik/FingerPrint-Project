// Students tab data and logic
export const studentsData = {
  // Student filtering options
  getYearFilterOptions: () => [
    { value: "all", label: "All Years" },
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
  ],

  // Filter students based on search query
  filterStudents: (students, searchQuery) => {
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  },

  // Student table columns
  getTableColumns: () => ["ID", "Name", "Email", "Department", "Year", "Attendance", "Actions"],

  // Get attendance status class
  getAttendanceStatusClass: (attendance) => (attendance >= 75 ? "success" : "error"),
}
