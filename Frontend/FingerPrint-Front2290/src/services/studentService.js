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




// Fetch all lectures and filter by faculty name
export const fetchTimeTable = async (email) => {
  try {
    if (!email || email.trim() === "") return [];

    const profile = await fetchStudentProfile(email);
    const student = Array.isArray(profile) ? profile[0] : profile;
    const facYearSemId = student?.facYearSem_ID;

    // Fetch mapping data to get faculty name
    const [semesters, facultyYears, faculties] = await Promise.all([
      fetchAllSemesters(),
      fetchAllFacultyYears(),
      fetchAllFaculties()
    ]);

    const semester = semesters.find(s => s.id === facYearSemId);
    const year = facultyYears.find(y => y.id === semester?.facultyYearId);
    const faculty = faculties.find(f => f.id === year?.facultyId);

    if (!faculty?.fac_Name) return [];

    const lecturesRes = await axios.get(`${API_BASE_URL}/api/Lecture/GetAllLecture`);
    const allLectures = lecturesRes.data;
    console.log("🎓 Faculty name used for filtering:", faculty?.fac_Name);
    console.log("📚 Total lectures from API:", allLectures.length);

    // ✅ Filter lectures by faculty name (case-insensitive recommended)
    const filtered = allLectures.filter(l =>
      l.fac_Name?.toLowerCase().trim() === faculty.fac_Name?.toLowerCase().trim()
    );

    // ✅ Map filtered lectures
    const dayMap = {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    };

    const mapped = filtered.map(lec => {
      const readableDay = dayMap[lec.day] || "Unknown";
      console.log(`📆 ${lec.lecture_Name} mapped to day: ${readableDay}`);

      return {
        course: lec.sub_Name,
        courseCode: lec.lecture_Name,
        instructor: lec.dr_NameAr,
        location: "Main Campus",
        time: `${lec.fromTime.slice(0, 5)} - ${lec.toTime.slice(0, 5)}`,
        day: readableDay
      };
    });


    console.log("📅 Filtered timetable data:", mapped);
    return mapped;
  } catch (err) {
    console.error("❌ Failed to fetch or map timetable:", err);
    return [];
  }
};



// Fetch Courses
export const fetchCourseAttendance = async (email) => {
  try {
    if (!email || email.trim() === "") return []

    const fullUrl = `${API_BASE_URL}/api/Studets/GetStudetByEmail?Email=${encodeURIComponent(email)}`
    const response = await axios.get(fullUrl)

    const student = response.data

    if (!student || !student.studentRooms || !Array.isArray(student.studentRooms)) return []

    return student.studentRooms.map((item) => ({
      courseCode: item.subject?.subCode || "N/A",
      name: item.subject?.subName || "Unnamed",
      instructor: item.doctor?.dr_NameEn || "TBD",
      credit: item.subject?.credit || 3,
    }))
  } catch (error) {
    console.error("❌ Error fetching course attendance from studentRooms:", error)
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

