// src/services/doctorService.js
// Mock API responses for doctor dashboard

// src/services/doctorService.js
// src/services/doctorService.js

const API_BASE_URL = "https://localhost:7069";

export const fetchDoctorProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Doctors/GetAllDoctors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("Failed to fetch doctor profile");

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const doc = data[0]; // get the first doctor — you can change logic here

      return {
        id: doc.dr_Code,
        name: doc.dr_NameEn,
        email: doc.dr_Email,
        phone: doc.phone,
        department: "Computer Engineering", // replace if available in your API
        title: "Associate Professor",        // replace if available in your API
        office: "Building C, Room 214",      // replace if available in your API
        officeHours: "Sunday & Tuesday, 2-4 PM",
        experience: 12,
        researchAreas: ["AI", "ML", "CV"]
      };
    }

    throw new Error("No doctor profile found.");
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return null;
  }
};


  
  export const fetchCourses = async () => {
    try {
    const response = await fetch(`${API_BASE_URL}/api/Doctors/GetAllDoctors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("Failed to fetch doctor profile");

    const data = await response.json();

    // Only return the needed fields
    return data.map(doc => ({
        courseCode: "CS201",
        name: doc.dr_NameAr,
        creditHours: 3,
        studentsCount: 50,
        averageAttendance: 92,
        status: "Completed"  // replace if available in your API
      }
    ));
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return []; // return empty array if error
  }
};
  
  export const fetchSchedule = async () => {
    try {
    const response = await fetch(`${API_BASE_URL}/api/Subjects/GetAllSubjects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("Failed to fetch doctor profile");

    const data = await response.json();

    // Only return the needed fields
    return data.map(doc => ({
        day: "Sunday", // replace if available in your API
        courseCode: "CS201", // problem !!!!!
        courseName: doc.sub_Name,
        startTime: "09:00 AM", // replace if available in your API
        endTime: "10:30 AM", // replace if available in your API
        duration: "1.5 hours", // replace if available in your API
        location: "Hall 1", // replace if available in your API
        studentsCount: 45 // replace if available in your API
      }
    ));
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return []; // return empty array if error
  }
};
  
  export const fetchAttendanceStats = async () => {
    try {
    const response = await fetch(`${API_BASE_URL}/api/Subjects/GetAllSubjects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("Failed to fetch doctor profile");

    const data = await response.json();

    // Only return the needed fields
    return data.map(doc => ({
        averageAttendance: 85,
      courseStats: 
        {
          courseCode:"CS201",
          courseName: doc.sub_Name,
          averageAttendance: 87,
          lastSessionAttendance: 91,
          atRiskStudents: 3,
          sessions: [
            {
              date: "May 2, 2025",
              time: "09:00 AM",
              location: "Hall 1",
              presentCount: 41,
              absentCount: 4,
              attendancePercentage: 91
            },
            {
              date: "Apr 28, 2025",
              time: "09:00 AM",
              location: "Hall 1",
              presentCount: 39,
              absentCount: 6,
              attendancePercentage: 87
            },
            {
              date: "Apr 25, 2025",
              time: "09:00 AM",
              location: "Hall 1",
              presentCount: 40,
              absentCount: 5,
              attendancePercentage: 89
            },
            {
              date: "Apr 21, 2025",
              time: "09:00 AM",
              location: "Hall 1",
              presentCount: 38,
              absentCount: 7,
              attendancePercentage: 84
            },
            {
              date: "Apr 18, 2025",
              time: "09:00 AM",
              location: "Hall 1",
              presentCount: 37,
              absentCount: 8,
              attendancePercentage: 82
            }
          ]
        }, // replace if available in your API
      }
    ));
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return []; // return empty array if error
  }
};
  ; // replace if available in your API   (problem)
  
  export const fetchStudentsList = async () => {
    try {
    const response = await fetch(`${API_BASE_URL}/api/Studets/GetAllStudets`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("Failed to fetch doctor profile");

    const data = await response.json();

    // Only return the needed fields
    return data.map(doc => (
      {
        id: doc.st_Code,
        name: doc.st_NameEn,
        email: doc.st_Email,
        department: doc.faculty,
        year: doc.facYearSem_ID,
        attendance:86 , // replace if available in your API
        courses: [
          {
            courseCode: "CS201",
            grades: {
              midterm: 60,
              assignments: 65,
              final: 62,
              total: 62,
              letter: "D"
            }
          }
        ]
      }
    
    ));
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return []; // return empty array if error
  }
};
  
  export const fetchNotifications = async () => {
    return [
      {
        id: 1,
        message: "Reminder: Faculty meeting tomorrow at 2 PM in Conference Room A.",
        date: "May 5, 2025",
        isRead: false
      },
      {
        id: 2,
        message: "New academic calendar for next semester has been published.",
        date: "May 3, 2025",
        isRead: false
      },
      {
        id: 3,
        message: "Your request for lab equipment has been approved.",
        date: "May 1, 2025",
        isRead: true
      },
      {
        id: 4,
        message: "Reminder: Final exam submission deadline is May 15.",
        date: "April 28, 2025",
        isRead: true
      },
      {
        id: 5,
        message: "Student Ahmed Tarek has requested a meeting.",
        date: "April 25, 2025",
        isRead: true
      }
    ];
  }; // replace if available in your API
  
  export const fetchGradeDistribution = async () => {
    return {
      "CS201": [
        { grade: "A", count: 10 },
        { grade: "A-", count: 8 },
        { grade: "B+", count: 7 },
        { grade: "B", count: 6 },
        { grade: "B-", count: 5 },
        { grade: "C+", count: 4 },
        { grade: "C", count: 3 },
        { grade: "D", count: 1 },
        { grade: "F", count: 1 }
      ],
      "CS303": [
        { grade: "A", count: 15 },
        { grade: "A-", count: 10 },
        { grade: "B+", count: 6 },
        { grade: "B", count: 4 },
        { grade: "B-", count: 2 },
        { grade: "C+", count: 1 },
        { grade: "C", count: 0 },
        { grade: "D", count: 0 },
        { grade: "F", count: 0 }
      ],
      "CS305": [
        { grade: "A", count: 8 },
        { grade: "A-", count: 7 },
        { grade: "B+", count: 9 },
        { grade: "B", count: 8 },
        { grade: "B-", count: 5 },
        { grade: "C+", count: 3 },
        { grade: "C", count: 1 },
        { grade: "D", count: 1 },
        { grade: "F", count: 0 }
      ]
    };
  }; // replace if available in your API
  
  export const fetchRecentActivity = async () => {
    return [
      {
        id: 1,
        type: "attendance",
        description: "Recorded attendance for CS303 - AI Fundamentals",
        time: "Today, 1:30 PM"
      },
      {
        id: 2,
        type: "grade",
        description: "Updated grades for CS201 -  1:30 PM"
      },
      {
        id: 2,
        type: "grade",
        description: "Updated grades for CS201 - Operating Systems",
        time: "Today, 11:45 AM"
      },
      {
        id: 3,
        type: "course",
        description: "Added new lecture materials for CS305 - Computer Networks",
        time: "Yesterday, 3:15 PM"
      },
      {
        id: 4,
        type: "attendance",
        description: "Recorded attendance for CS201 - Operating Systems",
        time: "Yesterday, 9:30 AM"
      },
      {
        id: 5,
        type: "grade",
        description: "Graded assignments for CS303 - AI Fundamentals",
        time: "May 3, 2025, 2:00 PM"
      }
    ];
  }; // replace if available in your API
  export const addOrUpdateDoctor = async (doctorData) => {
  try {
    const response = await fetch(`https://localhost:7069/api/Doctors/Add_OR_UpdateDoctor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(doctorData),
    });
    if (!response.ok) throw new Error("Failed to add or update doctor");
    return await response.json();
  } catch (error) {
    console.error("Error in addOrUpdateDoctor:", error);
    throw error;
  }
};

export const deleteDoctor = async (doctorId) => {
  try {
    const response = await fetch(`https://localhost:7069/api/Doctors/DeleteDoctor?id=${doctorId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to delete doctor");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteDoctor:", error);
    throw error;
  }
};

  
  