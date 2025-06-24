// Courses tab data and logic
export const coursesData = {
  // Course filtering options
  getFilterOptions: () => [
    { value: "all", label: "All Courses" },
    { value: "active", label: "Active Courses" },
    { value: "completed", label: "Completed Courses" },
    { value: "upcoming", label: "Upcoming Courses" },
  ],

  // Filter courses based on search query
  filterCourses: (courses, searchQuery) => {
    return courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  },

  // Course card data structure
  getCourseCardData: (course) => ({
    name: course.name,
    status: course.status,
    courseCode: course.courseCode,
    creditHours: course.creditHours,
    studentsCount: course.studentsCount,
    averageAttendance: course.averageAttendance,
  }),
}
