// src/services/studentService.js
// ✅ mock API responses until backend is ready
const API_BASE_URL = "https://localhost:7069";
export const fetchStudentProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Studets/GetAllStudets`, {
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
        displayName: doc.st_NameEn,
        email: doc.st_Email,
        department: doc.faculty,
        year: doc.facYearSem_ID,
        gpa: 3.4,
        fingerprintRegistered: true
      };
    }

    throw new Error("No doctor profile found.");
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return null;
  }
};
  
  // Example API: fetchTimetable with courseCode
export const fetchTimeTable = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Subjects/GetAllSubjects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("Failed to fetch doctor profile");

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const doc = data[0]; // you can change logic here

      // ✅ Wrap in array
      return [{
        courseCode:"CS201",
        course: doc.sub_Name,
        day: "Sunday",
        time: "09:00 AM - 10:30 AM",
        instructor:doc.instructors,
        location: "Hall 1"
      }];
    }

    throw new Error("No doctor profile found.");
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return [];
  }
};

  
  export const fetchAttendanceSummary = async () => {
    return {
      total: 30,
      attended: 26,
      missed: 4,
      percentage: 86.6
    };
  };
  
  export const fetchFingerprintLogs = async () => {
    return [
      { date: "2025-05-05", time: "09:00 AM", location: "Main Gate", result: "Success", courseCode: "CS201" },
      { date: "2025-05-05", time: "01:05 PM", location: "Main Gate", result: "Success", courseCode: "CS303" },
      { date: "2025-05-04", time: "08:55 AM", location: "Library", result: "Failed", courseCode: "CS305" }
    ];
  };
  
  
  export const matchFingerprint = async () => {
    const success = Math.random() > 0.2;
    return {
      success,
      message: success ? "Fingerprint matched ✅" : "Fingerprint not matched ❌"
    };
  };

 export const fetchCourseAttendance = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Subjects/GetAllSubjects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("Failed to fetch doctor profile");

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const doc = data[0]; // you can change logic here

      // ✅ Wrap in array
      return [{
        courseCode:"CS201",
        name:doc.sub_Name,
        instructor:doc.instructors,
        credit: 4,
        status:"Ongoing",
      }];
    } 

    throw new Error("No doctor profile found.");
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return [];
  }
};
  