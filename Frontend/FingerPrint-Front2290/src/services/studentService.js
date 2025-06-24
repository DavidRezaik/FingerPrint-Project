import axios from 'axios';
import config from "../config"

// At the top of your studentService.js file
const API_BASE_URL = config.BASE_URL;// Make sure this is correct
console.log("🔧 API_BASE_URL is set to:", API_BASE_URL);

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
//---------------------------------------------------------------------------------------


export const fetchTimeTable = async (email) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/Studets/DashBordStudets?Email=${email}`,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid data structure received from API");
    }

    if (response.data.length === 0) {
      return []; // No timetable
    }

    // You may adjust mapping here if needed based on actual timetable schema
    const schedule = response.data.map(item => ({
      day: "Sunday", // 🔧 TEMP — replace this with correct `item.day` when available
      courseCode: item.st_Code,
      course: item.st_NameEn,
      instructor: "Dr. Smith", // 🔧 TEMP
      location: "Room 101",    // 🔧 TEMP
      time: "08:00 AM - 10:00 AM", // 🔧 TEMP
      studentsCount: 25        // 🔧 TEMP
    }));

    return schedule;

  } catch (error) {
    console.error("Error fetching timetable:", error);
    return [];
  }
};


//---------------------------------------------------------------------------------------



export const fetchCourseAttendance = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/Subjects/${id}`,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid data structure received from API");
    }

    if (response.data.length === 0) {
      return []; // لا توجد بيانات، نرجع مصفوفة فارغة
    }

    // تحويل كل عنصر في المصفوفة إلى كائن حضور المادة المطلوب
    const courseAttendance = response.data.map(item => ({
      courseCode: item.subCode,
      name: item.subName,
      instructor: item.doctor,
      credit: item.credit,
      status: item.status
    }));

    return courseAttendance;

  } catch (error) {
    console.error("Error fetching course attendance:", error);
    return [];
  }
};

//---------------------------------------------------------------------------------------



export const fetchAttendanceSummary = async () => {
  return {
    total: 30,
    attended: 26,
    missed: 4,
    percentage: 86.6
  };
};

export const fetchFingerprintLogs = async () => {
  try {
    // جلب سجلات البصمة
    const logsResponse = await axios.get(`${API_BASE_URL}/api/FingerprintLogs/GetAllFingerprintLogs`, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!logsResponse.data) throw new Error("Failed to fetch fingerprint logs");

    const logsData = logsResponse.data;

    // جلب تفاصيل الكورسات
    const courseResponse = await axios.get(`${API_BASE_URL}/api/Attendance/GetAllSubjects`, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!courseResponse.data) throw new Error("Failed to fetch course details");

    const courseData = courseResponse.data;

    // دمج البيانات وتنسيقها
    return logsData.map((log, index) => ({
      date: log.date || "2025-05-05",
      time: log.time || "09:00 AM",
      location: log.location || "Main Gate",
      result: log.result || "Success",
      courseCode: courseData[index]?.subCode || "CS201"
    }));
  } catch (error) {
    console.error("Error fetching fingerprint logs:", error);
    return [];
  }
};

export const matchFingerprint = async () => {
  const success = Math.random() > 0.2;
  return {
    success,
    message: success ? "Fingerprint matched ✅" : "Fingerprint not matched ❌"
  };
};

