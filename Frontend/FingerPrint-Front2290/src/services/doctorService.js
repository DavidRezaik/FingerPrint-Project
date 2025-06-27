import axios from 'axios';
import config from "../config"

export default function Loading() {
  return null
}
const isDoctorUser = () => localStorage.getItem("userType") === "Doctor";

const API_BASE_URL = config.BASE_URL;
console.log("🔧 API_BASE_URL is set to:", API_BASE_URL);

/// Get Doctor Data and Map it
export const fetchDoctorProfile = async () => {
  if (!isDoctorUser()) {
    console.warn("⛔ Access denied: User is not a doctor");
    return null;
  }
  const email = localStorage.getItem("email"); // ✅ fixed: no `const email` in parameters
  if (!email || email === 'undefined' || email.trim() === '') {
    console.log("⚠️ No valid email provided to fetchDoctorProfile");
    return null;
  }

  try {
    const fullUrl = `${API_BASE_URL}/api/Doctors/GetDoctorByEmail?Email=${encodeURIComponent(email)}`;
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

    const raw = await response.text();
    console.log("✅ Raw response:", raw);

    const apiData = JSON.parse(raw);

    // ✅ Mapped doctor object ready for frontend use
    return {
      id: apiData.id,
      dr_Code: apiData.dr_Code,
      dr_NameAr: apiData.dr_NameAr,
      dr_NameEn: apiData.dr_NameEn,
      name: apiData.dr_NameEn || apiData.dr_NameAr || "Unknown",
      email: apiData.dr_Email,
      phone: apiData.phone,
      faculty: apiData.faculty || "N/A",
      id: apiData.fac_ID,
      dr_Image: apiData.dr_Image || "",
      department: apiData.faculty,
    };

  } catch (error) {
    console.error("❌ Error fetching doctor profile:", error);
    throw error;
  }
};



export const fetchCourses = async () => {
  try {
    // Step 1: Get the doctor profile
    const doctor = await fetchDoctorProfile();
    if (!doctor || !doctor.dr_NameAr) {
      console.warn("⚠️ No doctor profile or missing dr_NameAr");
      return [];
    }

    const doctorName = doctor.dr_NameAr.trim();

    // Step 2: Fetch all courses
    const response = await fetch(`${API_BASE_URL}/api/Subjects/GetAllSubjects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("❌ Failed to fetch subjects");

    const data = await response.json();

    // Step 3: Filter by doctor name (exact match)
    const filteredCourses = data.filter(subject =>
      subject.doctor && subject.doctor.trim() === doctorName
    );

    // Step 4: Map the filtered courses
    return filteredCourses.map(course => ({
      courseCode: course.subCode,
      courses: course.subName,
      creditHours: 3,              // placeholder
      studentsCount: 50,           // placeholder
      averageAttendance: 92,       // placeholder
      status: course.subName
    }));

  } catch (error) {
    console.error("❌ Error fetching courses by doctor:", error);
    return [];
  }
};



export const fetchSchedule = async () => {
  try {
    // Step 1: Get doctor profile
    const doctor = await fetchDoctorProfile();
    if (!doctor || !doctor.dr_NameAr) {
      console.warn("⚠️ Missing doctor name in profile.");
      return [];
    }

    const doctorNameAr = doctor.dr_NameAr.trim();
    console.log("👨‍⚕️ Doctor Arabic Name:", doctorNameAr);

    // Step 2: Fetch all lectures
    const response = await fetch(`${API_BASE_URL}/api/Lecture/GetAllLecture`, {
      method: "GET",
      headers: {
        "accept": "text/plain"
      }
    });

    if (!response.ok) {
      throw new Error("❌ Failed to fetch lecture schedule");
    }

    const lectures = await response.json();
    console.log(`📚 Total lectures received from API: ${lectures.length}`);

    // Step 3: Filter lectures by doctor name
    const filteredLectures = lectures.filter(lecture =>
      lecture.dr_NameAr && lecture.dr_NameAr.trim() === doctorNameAr
    );

    console.log(`✅ Lectures matching doctor (${doctorNameAr}): ${filteredLectures.length}`);
    console.table(filteredLectures); // show as table for easy debugging

    // Step 4: Map to simplified structure
    return filteredLectures.map(lec => ({
      lectureName: lec.lecture_Name,
      subjectName: lec.sub_Name,
      day: lec.day,
      fromTime: lec.fromTime,
      toTime: lec.toTime,
      faculty: lec.fac_Name
    }));

  } catch (error) {
    console.error("❌ Error in fetchSchedule:", error);
    return [];
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
        courseCode: "CS201",
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
    // 1. Fetch Doctor Profile
    const doctor = await fetchDoctorProfile();
    if (!doctor || !doctor.faculty) {
      console.warn("⚠️ Doctor profile missing or no faculty found.");
      return [];
    }

    // 2. Fetch all faculties
    const facultyResponse = await fetch(`${API_BASE_URL}/api/Faculty/GetAllFaculty`);
    const faculties = await facultyResponse.json();

    const matchedFaculty = faculties.find(f => f.fac_Name === doctor.faculty);
    if (!matchedFaculty) {
      console.warn("⚠️ No matching faculty found for doctor.");
      return [];
    }

    // 3. Fetch all faculty years
    const yearResponse = await fetch(`${API_BASE_URL}/api/FacultyYear/GetAllFacultyYear`);
    const facultyYears = await yearResponse.json();

    const matchedYears = facultyYears.filter(y => y.facultyId === matchedFaculty.id);
    const matchedYearIds = matchedYears.map(y => y.id);

    // 4. Fetch all faculty year semesters
    const semResponse = await fetch(`${API_BASE_URL}/api/FacultyYearSemister/GetAllSemisters`);
    const semisters = await semResponse.json();

    const matchedSemisters = semisters.filter(s => matchedYearIds.includes(s.facultyYearId));
    const matchedSemIds = matchedSemisters.map(s => s.id);

    // 5. Fetch all students
    const studentsResponse = await fetch(`${API_BASE_URL}/api/Studets/GetAllStudets`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!studentsResponse.ok) throw new Error("Failed to fetch students");
    const students = await studentsResponse.json();

    // 6. Filter students by matched semester IDs
    const filteredStudents = students.filter(s => matchedSemIds.includes(s.facYearSem_ID));

    // 7. Return mapped data
    return filteredStudents.map(doc => ({
      id: doc.st_Code,
      name: doc.st_NameEn,
      email: doc.st_Email,
      department: doc.faculty,
      year: doc.facYearSem_ID,
      attendance: 86,
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
    }));
  } catch (error) {
    console.error("❌ Error in fetchFilteredStudentsListByDoctor:", error);
    return [];
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


