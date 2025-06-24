// Schedule tab data and logic
export const scheduleData = {
  // Days of the week
  getDaysOfWeek: () => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

  // Filter schedule based on selected day
  filterSchedule: (schedule, selectedDay) => {
    return selectedDay === "All" ? schedule : schedule.filter((item) => item.day === selectedDay)
  },

  // Get timeline item data
  getTimelineItemData: (session) => ({
    day: session.day,
    startTime: session.startTime,
    duration: session.duration,
    courseName: session.courseName,
    courseCode: session.courseCode,
    location: session.location,
    studentsCount: session.studentsCount,
  }),
}
