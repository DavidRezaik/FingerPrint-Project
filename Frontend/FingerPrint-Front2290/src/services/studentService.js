import axios from 'axios'
import config from "../config"

const API_BASE_URL = config.BASE_URL
console.log("🔧 API_BASE_URL is set to:", API_BASE_URL)

//Get Student Data 
export const fetchStudentProfile = async (email) => {
  // Validate email before making the request
  if (!email || email === 'undefined' || email.trim() === '') {
    console.log("⚠️ No valid email provided to fetchStudentProfile");
    return null; // Return null instead of throwing an error
  }

  try {
    const fullUrl = `${API_BASE_URL}/api/Studets/GetStudetByEmail?Email=${encodeURIComponent(email)}`;
    console.log("🔍 Full URL being called:", fullUrl);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        "accept": "text/plain"
      }
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ Error response body:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.text();
    console.log("✅ Raw response:", data);

    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  } catch (error) {
    console.error("❌ Error fetching student profile:", error);
    throw error;
  }
};



// Get  Semesters
export const fetchAllSemesters = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/FacultyYearSemister/GetAllSemisters`);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch semesters:", error);
    return [];
  }
};

//  Get  Faculty Years
export const fetchAllFacultyYears = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/FacultyYear/GetAllFacultyYear`);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch faculty years:", error);
    return [];
  }
};

// Get Faculties
export const fetchAllFaculties = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/Faculty/GetAllFaculty`);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch faculties:", error);
    return [];
  }
};



// Fetch timetable for student
export const fetchTimeTable = async (email) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/Studets/DashBordStudets?Email=${email}`, {
      headers: { "Content-Type": "application/json" }
    })

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid data structure received from API")
    }

    if (response.data.length === 0) {
      return []
    }

    return response.data.map(item => ({
      day: "Sunday",
      courseCode: item.st_Code,
      course: item.st_NameEn,
      instructor: "Dr. Smith",
      location: "Room 101",
      time: "08:00 AM - 10:00 AM",
      studentsCount: 25
    }))
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return []
  }
}

// Fetch attendance details for a specific course
export const fetchCourseAttendance = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/Subjects/${id}`, {
      headers: { "Content-Type": "application/json" }
    })

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid data structure received from API")
    }

    if (response.data.length === 0) {
      return []
    }

    return response.data.map(item => ({
      courseCode: item.subCode,
      name: item.subName,
      instructor: item.doctor,
      credit: item.credit,
      status: item.status
    }))
  } catch (error) {
    console.error("Error fetching course attendance:", error)
    return []
  }
}

// Fetch attendance summary (mocked for now)
export const fetchAttendanceSummary = async () => {
  return {
    total: 30,
    attended: 26,
    missed: 4,
    percentage: 86.6
  }
}

// Fetch fingerprint logs and merge with course data
export const fetchFingerprintLogs = async () => {
  try {
    const logsResponse = await axios.get(`${API_BASE_URL}/api/FingerprintLogs/GetAllFingerprintLogs`, {
      headers: { "Content-Type": "application/json" }
    })

    if (!logsResponse.data) throw new Error("Failed to fetch fingerprint logs")

    const courseResponse = await axios.get(`${API_BASE_URL}/api/Attendance/GetAllSubjects`, {
      headers: { "Content-Type": "application/json" }
    })

    if (!courseResponse.data) throw new Error("Failed to fetch course details")

    const logsData = logsResponse.data
    const courseData = courseResponse.data

    return logsData.map((log, index) => ({
      date: log.date || "2025-05-05",
      time: log.time || "09:00 AM",
      location: log.location || "Main Gate",
      result: log.result || "Success",
      courseCode: courseData[index]?.subCode || "CS201"
    }))
  } catch (error) {
    console.error("Error fetching fingerprint logs:", error)
    return []
  }
}

// Simulate fingerprint match (mock)
export const matchFingerprint = async () => {
  const success = Math.random() > 0.2
  return {
    success,
    message: success ? "Fingerprint matched ✅" : "Fingerprint not matched ❌"
  }
}

// ✅ NEW: Fetch notifications for the student's academic semester
export const fetchStudentNotifications = async (facYearSem_ID) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/Notification/GetAllNotifications`, {
      headers: { "Content-Type": "application/json" }
    })

    if (!Array.isArray(response.data)) return []

    const filtered = response.data.filter((n) => n.facYearSem_ID === facYearSem_ID)

    const readIds = JSON.parse(localStorage.getItem("readNotifications") || "[]")

    const withReadStatus = filtered.map((n) => ({
      ...n,
      isRead: readIds.includes(n.id),
    }))

    return withReadStatus
  } catch (error) {
    console.error("❌ Failed to fetch student notifications:", error)
    return []
  }
}


