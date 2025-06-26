"use client"

import { useState, useEffect } from "react"
import { FaSearch } from "react-icons/fa"
import { fetchStudentProfile } from "../services/studentService"
import { useLanguage } from "../contexts/LanguageContext"
import config from "../config"

function CourseAttendanceTab({ searchQuery }) {
  const { t } = useLanguage()
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [doctorFilter, setDoctorFilter] = useState("all")
  const [courseFilter, setCourseFilter] = useState("all")
  const [search, setSearch] = useState(searchQuery || "")
  const BASE_URL = config.BASE_URL

  useEffect(() => {
    const loadData = async () => {
      try {
        const email = JSON.parse(localStorage.getItem("email"))
        if (!email) throw new Error("Student email not found")

        const profile = await fetchStudentProfile(email)
        if (!profile || !profile.facYearSem_ID) throw new Error("Student semester not found")

        // جلب المواد
        const coursesRes = await fetch(`${BASE_URL}/api/Subjects/GetAllSubjects`)
        const allCourses = await coursesRes.json()

        // جلب الغرف
        const roomsRes = await fetch(`${BASE_URL}/api/Rooms/GetAllRooms`)
        const allRooms = await roomsRes.json()

        // عمل map للغرف: room.id => room.room_Num
        const roomMap = {}
        allRooms.forEach((r) => {
          roomMap[r.id] = r.room_Num
        })

        // مواد الطالب فقط (حسب السنة الدراسية)
        const myCourses = allCourses
          .filter((c) => Number(c.facYearSem_ID) === Number(profile.facYearSem_ID))
          .map((c) => ({
            ...c,
            room_Num: c.room_ID && roomMap[c.room_ID] ? roomMap[c.room_ID] : t("Main Campus"),
          }))

        setCourses(myCourses)
        setFilteredCourses(myCourses)
      } catch (error) {
        console.error("❌ Error loading course attendance data:", error)
      }
    }
    loadData()
  }, [])

  // Unique filter values
  const doctors = Array.from(new Set(courses.map((c) => c.doctor))).filter(Boolean)
  const subjects = Array.from(new Set(courses.map((c) => c.subName))).filter(Boolean)

  // Filter handler
  useEffect(() => {
    let result = courses
    if (doctorFilter !== "all") {
      result = result.filter((c) => c.doctor === doctorFilter)
    }
    if (courseFilter !== "all") {
      result = result.filter((c) => c.subName === courseFilter)
    }
    if (search) {
      result = result.filter(
        (c) =>
          c.subName?.toLowerCase().includes(search.toLowerCase()) ||
          c.subCode?.toLowerCase().includes(search.toLowerCase()) ||
          c.doctor?.toLowerCase().includes(search.toLowerCase())
      )
    }
    setFilteredCourses(result)
  }, [doctorFilter, courseFilter, search, courses])

  return (
    <div className="section-layout">
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 0 }}>
        <h1 className="text-primary" style={{ fontSize: 28, fontWeight: 600 }}>{t("Course Attendance")}</h1>
        <p className="subtitle" style={{ color: "var(--text-light)" }}>{t("Monitor your attendance for each course")}</p>
      </div>

      {/* Filters */}
      <div className="data-filters" style={{
        display: "flex", alignItems: "center", gap: 18, marginBottom: 22, flexWrap: "wrap"
      }}>
        <div className="filter-group" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="filter-select"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            style={{ minWidth: 150 }}
          >
            <option value="all">{t("All Doctors")}</option>
            {doctors.map((dr) => (
              <option key={dr} value={dr}>{dr}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            style={{ minWidth: 150 }}
          >
            <option value="all">{t("All Courses")}</option>
            {subjects.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <div className="input-with-icon" style={{ minWidth: 220, position: "relative" }}>
            <FaSearch className="search-icon" style={{ left: 10, top: "50%", position: "absolute", transform: "translateY(-50%)", color: "#888" }} />
            <input
              className="course-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search courses...")}
              style={{ paddingLeft: 35 }}
            />
          </div>
        </div>
      </div>

      {/* Course cards grid */}
      <div className="courses-grid" style={{ marginTop: 0 }}>
        {filteredCourses.length === 0 ? (
          <div className="no-data-message" style={{ padding: 40 }}>
            <p>{t("No courses found matching your search criteria.")}</p>
          </div>
        ) : (
          filteredCourses.map((course, index) => (
            <div key={index} className="course-card" style={{ borderTopColor: "var(--primary-light)" }}>
              <div className="course-header" style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderBottom: "1px solid var(--border-color)", padding: "18px"
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>{course.subName}</h3>
                <span className="course-status active">{course.subCode}</span>
              </div>
              <div className="course-details" style={{ padding: 18 }}>
                <div className="course-info" style={{
                  display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16
                }}>
                  <div className="course-info-item">
                    <label>{t("Instructor")}</label>
                    <p>{course.doctor || t("TBD")}</p>
                  </div>
                  <div className="course-info-item">
                    <label>{t("Room")}</label>
                    <p>{course.room_Num || t("Main Campus")}</p>
                  </div>
                  <div className="course-info-item">
                    <label>{t("Faculty")}</label>
                    <p>{course.faculty || "-"}</p>
                  </div>
                  <div className="course-info-item">
                    <label>{t("Year")}</label>
                    <p>{course.year || "-"}</p>
                  </div>
                  <div className="course-info-item">
                    <label>{t("Semester")}</label>
                    <p>{course.semister || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CourseAttendanceTab
