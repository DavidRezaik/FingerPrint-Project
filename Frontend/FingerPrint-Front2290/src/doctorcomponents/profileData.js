// Profile tab data and logic
export const profileData = {
  // Profile-specific functions
  getProfileInitials: (name) => name?.charAt(0) || "D",

  // Profile sections structure
  getPersonalInfoFields: () => [
    { key: "name", label: "Full Name" },
    { key: "email", label: "Email Address" },
    { key: "id", label: "Faculty ID" },
    { key: "phone", label: "Phone Number", fallback: "Not provided" },
  ],

  getAcademicInfoFields: () => [
    { key: "department", label: "Department" },
    { key: "title", label: "Title" },
    { key: "office", label: "Office", fallback: "Not provided" },
    { key: "officeHours", label: "Office Hours", fallback: "Not provided" },
  ],

  getTeachingSummaryFields: (courses, students, doctor) => [
    { label: "Active Courses", value: courses.filter((c) => c.status === "Active").length },
    { label: "Total Students", value: students.length },
    { label: "Teaching Experience", value: `${doctor.experience || 0} years` },
    { label: "Research Areas", value: doctor.researchAreas?.join(", ") || "Not provided" },
  ],
}
