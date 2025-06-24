"use client"

import { useState, useEffect } from "react"
import { FaChartBar, FaBook, FaFingerprint } from "react-icons/fa"
import {
  fetchStudentProfile,
  fetchTimeTable,
  fetchAttendanceSummary,
  fetchFingerprintLogs,
  matchFingerprint,
  fetchCourseAttendance,
} from "../services/studentService"
import { useLanguage } from "../contexts/LanguageContext"

function DashboardTab({ setActiveTab }) {
  const { t } = useLanguage()

  // Student data states
  const [student, setStudent] = useState({})
  const [TimeTable, setTimeTable] = useState([])
  const [attendanceSummary, setAttendanceSummary] = useState({})
  const [fingerprintLogs, setFingerprintLogs] = useState([])
  const [fingerprintTodayScanned, setFingerprintTodayScanned] = useState(false)
  const [courses, setCourses] = useState([])
  const [notifications, setNotifications] = useState([
    { message: "Midterm exams start next week.", date: "2025-04-05", isRead: false },
    { message: "Project deadline extended.", date: "2025-04-03", isRead: true },
    { message: "New course materials available.", date: "2025-04-01", isRead: false },
    { message: "Campus closed for holiday.", date: "2025-03-28", isRead: true },
  ])
  const [isFingerprintScanning, setIsFingerprintScanning] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const userString = localStorage.getItem("email")
        if (!userString) {
          console.log("ℹ️ No user data found - user needs to login first")
          return
        }

        let email = null

        try {
          const parsed = JSON.parse(userString)
          email = typeof parsed === "object" && parsed.email ? parsed.email : parsed
        } catch {
          email = userString
        }

        if (!email || email.trim() === "") {
          console.log("ℹ️ No valid email found")
          return
        }

        const profileData = await fetchStudentProfile(email)
        if (!profileData) {
          console.log("ℹ️ No profile data returned")
          return
        }

        const apiData = Array.isArray(profileData) ? profileData[0] : profileData

        const mappedStudent = {
          id: apiData.id,
          displayName: apiData.st_NameEn || apiData.st_NameAr || "Unknown",
          st_NameAr: apiData.st_NameAr,
          st_NameEn: apiData.st_NameEn,
          email: apiData.st_Email,
          studentCode: apiData.st_Code,
          phone: apiData.phone,
          year: apiData.facultyYearSemister,
          department: "Computer Science",
          gpa: "3.5",
          fingerprintRegistered: apiData.fingerID > 0,
          fingerID: apiData.fingerID,
          st_Image: apiData.st_Image,
          facYearSem_ID: apiData.facYearSem_ID,
        }

        setStudent(mappedStudent)

        const [table, summary, logs, courseList] = await Promise.all([
          fetchTimeTable(email),
          fetchAttendanceSummary(),
          fetchFingerprintLogs(),
          fetchCourseAttendance(),
        ])

        setTimeTable(table)
        setAttendanceSummary(summary)
        setFingerprintLogs(logs)
        setCourses(courseList)

        const today = new Date().toISOString().slice(0, 10)
        const scannedToday = logs.some((log) => log.date === today && log.result === "Success")
        setFingerprintTodayScanned(scannedToday)
      } catch (error) {
        console.error("❌ Error loading student data:", error)
      }
    }

    loadData()
  }, [])

  const handleFingerprintScan = async () => {
    setIsFingerprintScanning(true)
    try {
      const result = await matchFingerprint()
      alert(result.message)
      if (result.success) setFingerprintTodayScanned(true)
    } catch (error) {
      alert(t("Failed to scan fingerprint."))
      console.error(error)
    } finally {
      setIsFingerprintScanning(false)
    }
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <h1>
          {t("Welcome back")}, {student.displayName}
        </h1>
        <p className="subtitle">{t("Here's what's happening with your academic progress")}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card" onClick={() => setActiveTab("courseAttendance")} style={{ cursor: "pointer" }}>
          <div className="stat-icon attendance">
            <FaChartBar />
          </div>
          <div className="stat-info">
            <h3>{t("Attendance Rate")}</h3>
            <div className="stat-value">{attendanceSummary.percentage?.toFixed(1)}%</div>
            <div className="stat-detail">
              <span>
                {attendanceSummary.attended} {t("of")} {attendanceSummary.total} {t("lectures")}
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab("courseAttendance")} style={{ cursor: "pointer" }}>
          <div className="stat-icon courses">
            <FaBook />
          </div>
          <div className="stat-info">
            <h3>{t("Active Courses")}</h3>
            <div className="stat-value">{courses.length}</div>
            <div className="stat-detail">
              <span>
                {
                  courses.filter((c) => {
                    const logsForCourse = fingerprintLogs.filter((log) => log.courseCode === c.courseCode)
                    const successLogs = logsForCourse.filter((log) => log.result === "Success").length
                    const totalSessions = logsForCourse.length || 1
                    const attendancePercent = Math.round((successLogs / totalSessions) * 100)
                    return attendancePercent < 75
                  }).length
                }{" "}
                {t("need attention")}
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab("fingerprintLog")} style={{ cursor: "pointer" }}>
          <div className="stat-icon fingerprint">
            <FaFingerprint />
          </div>
          <div className="stat-info">
            <h3>{t("Fingerprint Status")}</h3>
            <div className="stat-value">{fingerprintTodayScanned ? t("Scanned Today") : t("Not Scanned")}</div>
            <div className="stat-detail">
              {!fingerprintTodayScanned && (
                <button onClick={handleFingerprintScan} className="scan-btn" disabled={isFingerprintScanning}>
                  {isFingerprintScanning ? t("Scanning...") : t("Scan Now")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-col">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>{t("Today's Schedule")}</h3>
              <button className="view-all-btn" onClick={() => setActiveTab("schedule")}>
                {t("View All")}
              </button>
            </div>

            <div className="schedule-list">
              {(() => {
                const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
                const todaySessions = TimeTable.filter((session) => session.day === today)

                if (todaySessions.length === 0) {
                  return <p className="no-data">{t("No classes scheduled for today. 🎉")}</p>
                }

                return todaySessions.map((session, index) => (
                  <div key={index} className="schedule-item">
                    <div className="schedule-time">{session.time.split(" - ")[0]}</div>
                    <div className="schedule-details">
                      <h4>{session.course}</h4>
                      <p>
                        {session.location} • {session.instructor}
                      </p>
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>

        <div className="dashboard-col">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>{t("Recent Notifications")}</h3>
              <button className="view-all-btn" onClick={() => setActiveTab("notifications")}>
                {t("View All")}
              </button>
            </div>

            <div className="notification-list-compact">
              {notifications.slice(0, 3).map((note, index) => (
                <div key={index} className={`notification-item-compact ${!note.isRead ? "unread" : ""}`}>
                  <div className="notification-content">
                    <p>{note.message}</p>
                    <span className="notification-date">{note.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardTab
