import axios from 'axios'
import config from "../config"

const API_BASE_URL = config.BASE_URL
console.log("\uD83D\uDD27 API_BASE_URL is set to:", API_BASE_URL)

// Get Student Data 
// Check if logged-in user is student
const isStudent = () => localStorage.getItem("userType") === "Student";

// ----------------------------- Fetch Student Profile -----------------------------
export const fetchStudentProfile = async (email) => {
  if (!isStudent()) {
    console.warn("⛔ fetchStudentProfile called by non-student user");
    return null;
  }  if (!email || email === 'undefined' || email.trim() === '') {
    console.log("\u26A0\uFE0F No valid email provided to fetchStudentProfile")
    return null
  }

  try {
    const fullUrl = `${API_BASE_URL}/api/Studets/GetStudetByEmail?Email=${encodeURIComponent(email)}`
    console.log("\uD83D\uDD0D Full URL being called:", fullUrl)

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: { "accept": "text/plain" }
    })

    console.log("\ud83d\udcf1 Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("\u274C Error response body:", errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const data = await response.text()
    console.log("\u2705 Raw response:", data)

    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  } catch (error) {
    console.error("\u274C Error fetching student profile:", error)
    throw error
  }
}

export const fetchAllSemesters = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/FacultyYearSemister/GetAllSemisters`)
    return response.data
  } catch (error) {
    console.error("\u274C Failed to fetch semesters:", error)
    return []
  }
}

export const fetchAllFacultyYears = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/FacultyYear/GetAllFacultyYear`)
    return response.data
  } catch (error) {
    console.error("\u274C Failed to fetch faculty years:", error)
    return []
  }
}

export const fetchAllFaculties = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/Faculty/GetAllFaculty`)
    return response.data
  } catch (error) {
    console.error("\u274C Failed to fetch faculties:", error)
    return []
  }
}

export const fetchTimeTable = async (email) => {
  try {
    if (!email || email.trim() === "") return [];

    const profile = await fetchStudentProfile(email);
    const student = Array.isArray(profile) ? profile[0] : profile;
    if (!student || !student.facYearSem_ID) return [];

    console.log("✅ student.facYearSem_ID =", student.facYearSem_ID);

    // 1. جلب جميع المواد
    const allSubjectsRes = await axios.get(`${API_BASE_URL}/api/Subjects/GetAllSubjects`);
    const allSubjects = allSubjectsRes.data;

    // 2. فلترة المواد الخاصة بالسنة/السمستر للطالب
    const filteredSubjects = allSubjects.filter(
      (sub) => sub.facYearSem_ID === student.facYearSem_ID
    );
    console.log("✅ filteredSubjects", filteredSubjects);

    const subjectIds = filteredSubjects.map((sub) => sub.id);
    console.log("✅ subjectIds", subjectIds);

    // 3. جلب جميع المحاضرات
    const allLecturesRes = await axios.get(`${API_BASE_URL}/api/Lecture/GetAllLecture`);
    const allLectures = allLecturesRes.data;

    // 4. فلترة المحاضرات الخاصة بالمواد دي
    const myLectures = allLectures.filter((lec) => subjectIds.includes(lec.sub_ID));
    console.log("✅ myLectures", myLectures);

    // 5. جلب جميع الغرف
    const allRoomsRes = await axios.get(`${API_BASE_URL}/api/Rooms/GetAllRooms`);
    const allRooms = allRoomsRes.data;
    const roomMap = {};
    allRooms.forEach(r => {
      roomMap[r.id] = r.room_Num;
    });

    // 6. Mapping subjectId -> subject
    const subjectMap = {};
    filteredSubjects.forEach((sub) => (subjectMap[sub.id] = sub));

    const dayMap = {
      1: "Saturday",
      2: "Sunday",
      3: "Monday",
      4: "Tuesday",
      5: "Wednesday",
      6: "Thursday",
    };

    // 7. إعداد جدول الطالب مع عرض اسم الغرفة
    const mapped = myLectures.map((lec) => {
      const subject = subjectMap[lec.sub_ID] || {};
      // حاول تجيب room_ID من المحاضرة أولاً، ثم من المادة
      let roomName = "Main Campus";
      if (lec.room_ID && roomMap[lec.room_ID]) {
        roomName = roomMap[lec.room_ID];
      } else if (subject.room_ID && roomMap[subject.room_ID]) {
        roomName = roomMap[subject.room_ID];
      }
      return {
        course: lec.subjects || subject.subName || "-",
        courseCode: subject.subCode || "-",
        instructor: subject.doctor || "TBD",
        location: roomName,
        time: `${lec.fromTime?.slice(0, 5)} - ${lec.toTime?.slice(0, 5)}`,
        day: dayMap[lec.day] || "Unknown",
      };
    });

    console.log("📅 Student schedule mapped:", mapped);
    return mapped;
  } catch (err) {
    console.error("❌ Failed to fetch or map timetable:", err);
    return [];
  }
};


export const fetchCourseAttendance = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/Subjects/${id}`, {
      headers: { "Content-Type": "application/json" }
    })

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid data structure received from API")
    }

    if (response.data.length === 0) return []

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

export const fetchAttendanceSummary = async () => {
  return {
    total: 30,
    attended: 26,
    missed: 4,
    percentage: 86.6
  }
}

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

export const matchFingerprint = async () => {
  const success = Math.random() > 0.2
  return {
    success,
    message: success ? "Fingerprint matched ✅" : "Fingerprint not matched ❌"
  }
}

export const fetchStudentNotifications = async (facYearSem_ID) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/Notification/GetAllNotifications`, {
      headers: { "Content-Type": "application/json" }
    })

    if (!Array.isArray(response.data)) return []

    const filtered = response.data.filter((n) => n.facYearSem_ID === facYearSem_ID)
    const readIds = JSON.parse(localStorage.getItem("readNotifications") || "[]")

    return filtered.map((n) => ({
      ...n,
      isRead: readIds.includes(n.id)
    }))
  } catch (error) {
    console.error("\u274C Failed to fetch student notifications:", error)
    return []
  }
}