"use client"

import { useState, useEffect } from "react"
import { FaChartBar } from "react-icons/fa"
import { fetchCourseAttendance, fetchFingerprintLogs } from "../services/studentService"
import { useLanguage } from "../contexts/LanguageContext"

function CourseAttendanceTab({ searchQuery }) {
  const { t } = useLanguage()

  const [courses, setCourses] = useState([])
  const [fingerprintLogs, setFingerprintLogs] = useState([])
  const [courseFilter, setCourseFilter] = useState("all")

  useEffect(() => {
    const loadData = async () => {
      try {
        const [courseList, logs] = await Promise.all([fetchCourseAttendance(), fetchFingerprintLogs()])

        setCourses(courseList)
        setFingerprintLogs(logs)
      } catch (error) {
        console.error("❌ Error loading course attendance data:", error)
      }
    }

    loadData()
  }, [])

  const handleGenerateReport = () => {
    const reportData = {
      totalCourses: courses.length,
      date: new Date().toLocaleDateString(),
    }

    alert(`Attendance Report Generated:\n\nTotal Courses: ${reportData.totalCourses}\nDate: ${reportData.date}`)
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchQuery === "" ||
      course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesFilter = true
    if (courseFilter === "low") {
      const logsForCourse = fingerprintLogs.filter((log) => log.courseCode === course.courseCode)
      const successLogs = logsForCourse.filter((log) => log.result === "Success").length
      const totalSessions = logsForCourse.length || 1
      const attendancePercent = Math.round((successLogs / totalSessions) * 100)
      matchesFilter = attendancePercent < 75
    } else if (courseFilter === "good") {
      const logsForCourse = fingerprintLogs.filter((log) => log.courseCode === course.courseCode)
      const successLogs = logsForCourse.filter((log) => log.result === "Success").length
      const totalSessions = logsForCourse.length || 1
      const attendancePercent = Math.round((successLogs / totalSessions) * 100)
      matchesFilter = attendancePercent >= 75
    }

    return matchesSearch && matchesFilter
  })

  return (
    <div className="section-layout">
      <div className="section-header">
        <h1>{t("Course Attendance")}</h1>
        <p className="subtitle">{t("Monitor your attendance for each course")}</p>
      </div>

      <div className="data-filters">
        <div className="filter-group">
          <select className="filter-select" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="all">{t("All Courses")}</option>
            <option value="low">{t("Low Attendance")}</option>
            <option value="good">{t("Good Attendance")}</option>
          </select>
        </div>

        <button className="action-button" onClick={handleGenerateReport}>
          <FaChartBar /> {t("Generate Report")}
        </button>
      </div>

      <div className="data-table-container">
        {filteredCourses.length === 0 ? (
          <div className="no-data-message">
            <p>{t("No courses found matching your search criteria.")}</p>
          </div>
        ) : (
          <div className="course-cards">
            {filteredCourses.map((course, index) => {
              const logsForCourse = fingerprintLogs.filter((log) => log.courseCode === course.courseCode)
              const successLogs = logsForCourse.filter((log) => log.result === "Success").length
              const totalSessions = logsForCourse.length || 1
              const attendancePercent = Math.round((successLogs / totalSessions) * 100)
              const status = attendancePercent >= 75 ? "good" : "low"

              return (
                <div key={index} className={`course-card ${status}`}>
                  <div className="course-header">
                    <h3>{course.name}</h3>
                    <span className={`course-status ${status}`}>
                      {status === "good" ? t("Good Standing") : t("Low Attendance")}
                    </span>
                  </div>

                  <div className="course-details">
                    <div className="course-info">
                      <div className="course-info-item">
                        <label>{t("Course Code")}</label>
                        <p>{course.courseCode}</p>
                      </div>
                      <div className="course-info-item">
                        <label>{t("Instructor")}</label>
                        <p>{course.instructor || "TBD"}</p>
                      </div>
                      <div className="course-info-item">
                        <label>{t("Credit Hours")}</label>
                        <p>{course.credit}</p>
                      </div>
                    </div>

                    <div className="attendance-chart">
                      <div className="attendance-percent">
                        <svg viewBox="0 0 36 36" className="circular-chart">
                          <path
                            className="circle-bg"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="circle"
                            strokeDasharray={`${attendancePercent}, 100`}
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <text x="18" y="20.35" className="percentage">
                            {attendancePercent}%
                          </text>
                        </svg>
                      </div>
                      <div className="attendance-details">
                        <p>
                          <strong>{successLogs}</strong> {t("of")} <strong>{totalSessions}</strong>{" "}
                          {t("sessions attended")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseAttendanceTab
