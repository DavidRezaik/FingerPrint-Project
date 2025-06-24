// src/components/DoctorDashboard.js
"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaChartBar,
  FaBook,
  FaCalendarAlt,
  FaBars,
  FaMoon,
  FaSun,
  FaChevronDown,
  FaGlobe,
  FaEdit,
  FaKey,
  FaSignOutAlt,
  FaSearch,
  FaClipboardList,
  FaFileAlt,
  FaUsers,
  FaPlus,
  FaTrashAlt,
} from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
import {
  fetchDoctorProfile,
  fetchCourses,
  fetchSchedule,
  fetchAttendanceStats,
  fetchStudentsList,
  fetchGradeDistribution,
  addOrUpdateDoctor,
  deleteDoctor,
} from "./services/doctorService"

// Import data modules
import { dashboardData } from "./doctorcomponents/dashboardData"
import { profileData } from "./doctorcomponents/profileData"
import { coursesData } from "./doctorcomponents/coursesData"
import { studentsData } from "./doctorcomponents/studentsData"
import { doctorsManagementData } from "./doctorcomponents/doctorsManagementData"
import { attendanceData } from "./doctorcomponents/attendanceData"
import { scheduleData } from "./doctorcomponents/scheduleData"
import { settingsData } from "./doctorcomponents/settingsData"
import { navigationData } from "./doctorcomponents/navigationData"

import "./dashboard.css"

function DoctorDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [collapsed, setCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState("english")
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedDay, setSelectedDay] = useState("All")
  const profileDropdownRef = useRef(null)

  // Doctor data states
  const [doctor, setDoctor] = useState({})
  const [courses, setCourses] = useState([])
  const [schedule, setSchedule] = useState([])
  const [attendanceStats, setAttendanceStats] = useState({})
  const [students, setStudents] = useState([])
  const [gradeDistribution, setGradeDistribution] = useState({})

  // New states for managing doctor/faculty CRUD operations
  const [showAddDoctorForm, setShowAddDoctorForm] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [newDoctorData, setNewDoctorData] = useState(doctorsManagementData.getInitialFormData())

  // API URL state
  const [apiUrl, setApiUrl] = useState(process.env.REACT_APP_API_URL || "https://your-backend-api.com/api")

  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingSchedule, setLoadingSchedule] = useState(true)
  const [loadingAttendance, setLoadingAttendance] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingGrades, setLoadingGrades] = useState(true)
  const [loadingDoctorCrud, setLoadingDoctorCrud] = useState(false)
  const [errorDoctorCrud, setErrorDoctorCrud] = useState(null)

  // Error states
  const [errorProfile, setErrorProfile] = useState(null)
  const [errorCourses, setErrorCourses] = useState(null)
  const [errorSchedule, setErrorSchedule] = useState(null)
  const [errorAttendance, setErrorAttendance] = useState(null)
  const [errorStudents, setErrorStudents] = useState(null)
  const [errorGrades, setErrorGrades] = useState(null)

  // Get navigation data
  const tabs = navigationData.getTabs()

  // Load data function
  const loadData = async () => {
    try {
      setLoadingProfile(true)
      setLoadingCourses(true)
      setLoadingSchedule(true)
      setLoadingAttendance(true)
      setLoadingStudents(true)
      setLoadingGrades(true)
      setErrorProfile(null)
      setErrorCourses(null)
      setErrorSchedule(null)
      setErrorAttendance(null)
      setErrorStudents(null)
      setErrorGrades(null)

      const [profile, coursesData, scheduleData, attendanceData, studentsData, gradeData] = await Promise.all([
        fetchDoctorProfile(apiUrl).catch((err) => {
          throw new Error("Profile: " + err.message)
        }),
        fetchCourses(apiUrl).catch((err) => {
          throw new Error("Courses: " + err.message)
        }),
        fetchSchedule(apiUrl).catch((err) => {
          throw new Error("Schedule: " + err.message)
        }),
        fetchAttendanceStats(apiUrl).catch((err) => {
          throw new Error("Attendance: " + err.message)
        }),
        fetchStudentsList(apiUrl).catch((err) => {
          throw new Error("Students: " + err.message)
        }),
        fetchGradeDistribution(apiUrl).catch((err) => {
          throw new Error("Grades: " + err.message)
        }),
      ])

      setDoctor(profile)
      setCourses(coursesData)
      setSchedule(scheduleData)
      setAttendanceStats(attendanceData)
      setStudents(studentsData)
      setGradeDistribution(gradeData)

      // Set default selected course
      if (coursesData.length > 0) {
        setSelectedCourse(coursesData[0].courseCode)
      }
    } catch (error) {
      console.error("Error loading doctor data:", error.message)
      if (error.message.startsWith("Profile:")) setErrorProfile(error.message)
      if (error.message.startsWith("Courses:")) setErrorCourses(error.message)
      if (error.message.startsWith("Schedule:")) setErrorSchedule(error.message)
      if (error.message.startsWith("Attendance:")) setErrorAttendance(error.message)
      if (error.message.startsWith("Students:")) setErrorStudents(error.message)
      if (error.message.startsWith("Grades:")) setErrorGrades(error.message)
    } finally {
      setLoadingProfile(false)
      setLoadingCourses(false)
      setLoadingSchedule(false)
      setLoadingAttendance(false)
      setLoadingStudents(false)
      setLoadingGrades(false)
    }
  }

  useEffect(() => {
    loadData()

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [apiUrl])

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/")
    }
  }

  const toggleDarkMode = () => setDarkMode(!darkMode)

  const toggleLanguage = () => {
    setLanguage(language === "english" ? "arabic" : "english")
  }

  // Handler for adding/updating a doctor
  const handleAddOrUpdateDoctor = async (e) => {
    e.preventDefault()
    setLoadingDoctorCrud(true)
    setErrorDoctorCrud(null)

    const doctorToSubmit = doctorsManagementData.prepareDoctorData(newDoctorData)

    try {
      await addOrUpdateDoctor(apiUrl, doctorToSubmit)
      alert(editingDoctor ? "Doctor updated successfully!" : "Doctor added successfully!")
      setShowAddDoctorForm(false)
      setEditingDoctor(null)
      setNewDoctorData(doctorsManagementData.getInitialFormData())
      loadData()
    } catch (error) {
      setErrorDoctorCrud(error.message)
      console.error("CRUD Error:", error)
    } finally {
      setLoadingDoctorCrud(false)
    }
  }

  // Handler for deleting a doctor
  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm(`Are you sure you want to delete doctor with ID: ${doctorId}?`)) {
      setLoadingDoctorCrud(true)
      setErrorDoctorCrud(null)
      try {
        await deleteDoctor(apiUrl, doctorId)
        alert("Doctor deleted successfully!")
        loadData()
      } catch (error) {
        setErrorDoctorCrud(error.message)
        console.error("CRUD Error:", error)
      } finally {
        setLoadingDoctorCrud(false)
      }
    }
  }

  const handleEditDoctorClick = (doctor) => {
    setEditingDoctor(doctor)
    setNewDoctorData(doctorsManagementData.populateFormData(doctor))
    setShowAddDoctorForm(true)
  }

  // Get breadcrumb title based on active tab
  const getBreadcrumbTitle = () => navigationData.getBreadcrumbTitle(activeTab, tabs)

  // Filter students based on search query
  const filteredStudents = studentsData.filterStudents(students, searchQuery)

  // Filter courses based on search query
  const filteredCourses = coursesData.filterCourses(courses, searchQuery)

  // Filter schedule based on selected day
  const filteredSchedule = scheduleData.filterSchedule(schedule, selectedDay)

  // Display loading or error messages
  const renderLoadingOrError = () => {
    if (loadingProfile || loadingCourses || loadingSchedule || loadingAttendance || loadingStudents || loadingGrades) {
      return <div className="loading-message">Loading data...</div>
    }
    if (errorProfile || errorCourses || errorSchedule || errorAttendance || errorStudents || errorGrades) {
      return (
        <div className="error-message">
          <p>Error loading data:</p>
          <ul>
            {errorProfile && <li>{errorProfile}</li>}
            {errorCourses && <li>{errorCourses}</li>}
            {errorSchedule && <li>{errorSchedule}</li>}
            {errorAttendance && <li>{errorAttendance}</li>}
            {errorStudents && <li>{errorStudents}</li>}
            {errorGrades && <li>{errorGrades}</li>}
          </ul>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`layout ${darkMode ? "dark-mode" : ""} ${language === "arabic" ? "rtl" : "ltr"}`}>
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">🎓 Akhbar El-Youm</h2>
          <div className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
            <FaBars />
          </div>
        </div>

        <div className="sidebar-content">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="tab-icon">{tab.icon}</div>
              {!collapsed && (
                <>
                  <span className="tab-label">{tab.label}</span>
                  {tab.badge > 0 && <span className="tab-badge">{tab.badge}</span>}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FaSun className="theme-icon" /> : <FaMoon className="theme-icon" />}
            {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </div>
        </div>
      </div>

      <div className="main">
        <header className="header">
          <div className="header-left">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="header-right" ref={profileDropdownRef}>
            <div className="profile-dropdown" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
              <div className="profile-info">
                <div className="profile-avatar">{profileData.getProfileInitials(doctor.name)}</div>
                <span className="profile-name">{doctor.name || "Doctor"}</span>
                <FaChevronDown className="dropdown-icon" />
              </div>

              {profileDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{profileData.getProfileInitials(doctor.name)}</div>
                    <div className="dropdown-user-info">
                      <h4>{doctor.name || "Doctor"}</h4>
                      <p>{doctor.email || "email@example.com"}</p>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-item">
                    <FaEdit className="dropdown-item-icon" />
                    <span>Edit Profile</span>
                  </div>

                  <div className="dropdown-item">
                    <FaKey className="dropdown-item-icon" />
                    <span>Change Password</span>
                  </div>

                  <div className="dropdown-item" onClick={toggleLanguage}>
                    <FaGlobe className="dropdown-item-icon" />
                    <span>{language === "english" ? "العربية" : "English"}</span>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-item logout" onClick={handleLogout}>
                    <FaSignOutAlt className="dropdown-item-icon" />
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          <div className="breadcrumb">
            <span className="breadcrumb-item">Home</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item active">{getBreadcrumbTitle()}</span>
          </div>

          <div className="content">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="tab-content"
              >
                {renderLoadingOrError() ||
                  (loadingDoctorCrud && <div className="loading-message">Performing action...</div>) ||
                  (errorDoctorCrud && <div className="error-message">{errorDoctorCrud}</div>)}

                {!loadingProfile && !errorProfile && activeTab === "dashboard" && (
                  <div className="dashboard-layout">
                    <div className="dashboard-header">
                      <h1>{dashboardData.getWelcomeMessage(doctor.name)}</h1>
                      <p className="subtitle">{dashboardData.getSubtitle()}</p>
                    </div>

                    <div className="dashboard-stats">
                      <div className="stat-card">
                        <div className="stat-icon courses">
                          <FaBook />
                        </div>
                        <div className="stat-info">
                          <h3>Active Courses</h3>
                          <div className="stat-value">{dashboardData.getActiveCoursesCount(courses)}</div>
                          <div className="stat-detail">
                            <span>Total: {courses.length} courses</span>
                          </div>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon attendance">
                          <FaUsers />
                        </div>
                        <div className="stat-info">
                          <h3>Total Students</h3>
                          <div className="stat-value">{dashboardData.getTotalStudentsCount(students)}</div>
                          <div className="stat-detail">
                            <span>Across all courses</span>
                          </div>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon gpa">
                          <FaChartBar />
                        </div>
                        <div className="stat-info">
                          <h3>Average Attendance</h3>
                          <div className="stat-value">{dashboardData.getAverageAttendance(attendanceStats)}%</div>
                          <div className="stat-detail">
                            <span>Across all courses</span>
                          </div>
                        </div>
                      </div>

                      <div className="stat-card">
                        <div className="stat-icon fingerprint">
                          <FaCalendarAlt />
                        </div>
                        <div className="stat-info">
                          <h3>Today's Classes</h3>
                          <div className="stat-value">{dashboardData.getTodayClassesCount(schedule)}</div>
                          <div className="stat-detail">
                            <span>Classes scheduled today</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-row">
                      <div className="dashboard-col">
                        <div className="dashboard-card">
                          <div className="card-header">
                            <h3>Today's Schedule</h3>
                            <button className="view-all-btn" onClick={() => setActiveTab("schedule")}>
                              View All
                            </button>
                          </div>

                          <div className="schedule-list">
                            {(() => {
                              const todaySessions = dashboardData.getTodaySchedule(schedule)

                              if (todaySessions.length === 0) {
                                return <p className="no-data">No classes scheduled for today.</p>
                              }

                              return todaySessions.map((session, index) => (
                                <div key={index} className="schedule-item">
                                  <div className="schedule-time">{session.startTime}</div>
                                  <div className="schedule-details">
                                    <h4>{session.courseName}</h4>
                                    <p>
                                      {session.location} • {session.duration}
                                    </p>
                                  </div>
                                </div>
                              ))
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-card">
                      <div className="card-header">
                        <h3>Course Attendance Overview</h3>
                        <select
                          className="course-select"
                          value={selectedCourse || ""}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                          {courses.map((course) => (
                            <option key={course.courseCode} value={course.courseCode}>
                              {course.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="attendance-chart-container">
                        <div className="attendance-summary">
                          <div className="attendance-metric">
                            <h4>Average Attendance</h4>
                            <div className="metric-value">
                              {attendanceStats.courseStats?.find((c) => c.courseCode === selectedCourse)
                                ?.averageAttendance || 0}
                              %
                            </div>
                          </div>
                          <div className="attendance-metric">
                            <h4>Last Session</h4>
                            <div className="metric-value">
                              {attendanceStats.courseStats?.find((c) => c.courseCode === selectedCourse)
                                ?.lastSessionAttendance || 0}
                              %
                            </div>
                          </div>
                          <div className="attendance-metric">
                            <h4>At Risk Students</h4>
                            <div className="metric-value">
                              {attendanceStats.courseStats?.find((c) => c.courseCode === selectedCourse)
                                ?.atRiskStudents || 0}
                            </div>
                          </div>
                        </div>

                        <div className="attendance-bars">
                          {attendanceStats.courseStats
                            ?.find((c) => c.courseCode === selectedCourse)
                            ?.sessions?.map((session, index) => (
                              <div key={index} className="attendance-bar-container">
                                <div className="attendance-date">{session.date}</div>
                                <div className="attendance-bar-wrapper">
                                  <div
                                    className="attendance-bar"
                                    style={{ height: `${session.attendancePercentage}%` }}
                                  ></div>
                                </div>
                                <div className="attendance-percentage">{session.attendancePercentage}%</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!loadingProfile && !errorProfile && activeTab === "profile" && (
                  <div className="profile-layout">
                    <div className="profile-header">
                      <div className="profile-avatar-large">{profileData.getProfileInitials(doctor.name)}</div>
                      <div className="profile-header-info">
                        <h1>{doctor.name}</h1>
                        <p>
                          {doctor.title} • {doctor.department}
                        </p>
                      </div>
                      <button className="edit-profile-btn">
                        <FaEdit /> Edit Profile
                      </button>
                    </div>

                    <div className="profile-content">
                      <div className="profile-section">
                        <h3>Personal Information</h3>
                        <div className="profile-info-grid">
                          {profileData.getPersonalInfoFields().map((field) => (
                            <div key={field.key} className="profile-info-item">
                              <label>{field.label}</label>
                              <p>{doctor[field.key] || field.fallback || doctor[field.key]}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="profile-section">
                        <h3>Academic Information</h3>
                        <div className="profile-info-grid">
                          {profileData.getAcademicInfoFields().map((field) => (
                            <div key={field.key} className="profile-info-item">
                              <label>{field.label}</label>
                              <p>{doctor[field.key] || field.fallback || doctor[field.key]}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="profile-section">
                        <h3>Teaching Summary</h3>
                        <div className="profile-info-grid">
                          {profileData.getTeachingSummaryFields(courses, students, doctor).map((field, index) => (
                            <div key={index} className="profile-info-item">
                              <label>{field.label}</label>
                              <p>{field.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!loadingCourses && !errorCourses && activeTab === "courses" && (
                  <div className="section-layout">
                    <div className="section-header">
                      <h1>Courses</h1>
                      <p className="subtitle">Manage your courses and teaching materials</p>
                    </div>

                    <div className="data-filters">
                      <div className="filter-group">
                        <select className="filter-select">
                          {coursesData.getFilterOptions().map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button className="action-button">
                        <FaBook /> Add New Course
                      </button>
                    </div>

                    <div className="courses-grid">
                      {filteredCourses.map((course, index) => {
                        const courseData = coursesData.getCourseCardData(course)
                        return (
                          <div key={index} className={`course-card ${courseData.status.toLowerCase()}`}>
                            <div className="course-header">
                              <h3>{courseData.name}</h3>
                              <span className={`course-status ${courseData.status.toLowerCase()}`}>
                                {courseData.status}
                              </span>
                            </div>
                            <div className="course-details">
                              <div className="course-info">
                                <div className="course-info-item">
                                  <label>Course Code</label>
                                  <p>{courseData.courseCode}</p>
                                </div>
                                <div className="course-info-item">
                                  <label>Credit Hours</label>
                                  <p>{courseData.creditHours}</p>
                                </div>
                                <div className="course-info-item">
                                  <label>Students</label>
                                  <p>{courseData.studentsCount}</p>
                                </div>
                                <div className="course-info-item">
                                  <label>Average Attendance</label>
                                  <p>{courseData.averageAttendance}%</p>
                                </div>
                              </div>
                            </div>
                            <div className="course-actions">
                              <button className="course-action-btn">View Details</button>
                              <button className="course-action-btn">Attendance</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {!loadingStudents && !errorStudents && activeTab === "students" && (
                  <div className="section-layout">
                    <div className="section-header">
                      <h1>Students</h1>
                      <p className="subtitle">View and manage your students</p>
                    </div>

                    <div className="data-filters">
                      <div className="filter-group">
                        <select className="filter-select">
                          <option value="all">All Students</option>
                          {courses.map((course) => (
                            <option key={course.courseCode} value={course.courseCode}>
                              {course.name}
                            </option>
                          ))}
                        </select>

                        <select className="filter-select">
                          {studentsData.getYearFilterOptions().map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button className="action-button">
                        <FaFileAlt /> Export List
                      </button>
                    </div>

                    <div className="data-table-container">
                      {filteredStudents.length === 0 ? (
                        <div className="no-data-message">
                          <p>No students found matching your search criteria.</p>
                        </div>
                      ) : (
                        <table className="data-table">
                          <thead>
                            <tr>
                              {studentsData.getTableColumns().map((column) => (
                                <th key={column}>{column}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.map((student, index) => (
                              <tr key={index}>
                                <td>{student.id}</td>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>{student.department}</td>
                                <td>{student.year}</td>
                                <td>
                                  <span
                                    className={`status-badge ${studentsData.getAttendanceStatusClass(student.attendance)}`}
                                  >
                                    {student.attendance}%
                                  </span>
                                </td>
                                <td>
                                  <div className="table-actions">
                                    <button className="table-action-btn">View</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "doctors-management" && (
                  <div className="section-layout">
                    <div className="section-header">
                      <h1>Doctors Management</h1>
                      <p className="subtitle">Add, edit, or delete doctor profiles</p>
                    </div>

                    <div className="data-filters">
                      <div className="filter-group">{/* Add filters specific to doctors if needed */}</div>

                      <button
                        className="action-button"
                        onClick={() => {
                          setShowAddDoctorForm(true)
                          setEditingDoctor(null)
                          setNewDoctorData(doctorsManagementData.getInitialFormData())
                        }}
                      >
                        <FaPlus /> Add New Doctor
                      </button>
                    </div>

                    {showAddDoctorForm && (
                      <div className="form-container">
                        <h3>{editingDoctor ? "Edit Doctor" : "Add New Doctor"}</h3>
                        <form onSubmit={handleAddOrUpdateDoctor}>
                          {doctorsManagementData.getFormFields().map((field) => (
                            <div key={field.key} className="form-group">
                              <label>{field.label}:</label>
                              <input
                                type={field.type}
                                value={newDoctorData[field.key]}
                                onChange={(e) => setNewDoctorData({ ...newDoctorData, [field.key]: e.target.value })}
                                required={field.required}
                              />
                            </div>
                          ))}
                          <div className="form-actions">
                            <button type="submit" className="action-button primary" disabled={loadingDoctorCrud}>
                              {loadingDoctorCrud
                                ? editingDoctor
                                  ? "Updating..."
                                  : "Adding..."
                                : editingDoctor
                                  ? "Update Doctor"
                                  : "Add Doctor"}
                            </button>
                            <button
                              type="button"
                              className="action-button secondary"
                              onClick={() => setShowAddDoctorForm(false)}
                              disabled={loadingDoctorCrud}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    <div className="data-table-container">
                      {filteredStudents.length === 0 ? (
                        <div className="no-data-message">
                          <p>No doctors found. Try adding one!</p>
                        </div>
                      ) : (
                        <table className="data-table">
                          <thead>
                            <tr>
                              {doctorsManagementData.getTableColumns().map((column) => (
                                <th key={column}>{column}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.map((doctorEntry, index) => (
                              <tr key={index}>
                                <td>{doctorEntry.id}</td>
                                <td>{doctorEntry.name}</td>
                                <td>{doctorEntry.email}</td>
                                <td>{doctorEntry.department}</td>
                                <td>{doctorEntry.title || "N/A"}</td>
                                <td>
                                  <div className="table-actions">
                                    <button
                                      className="table-action-btn"
                                      onClick={() => handleEditDoctorClick(doctorEntry)}
                                    >
                                      <FaEdit /> Edit
                                    </button>
                                    <button
                                      className="table-action-btn delete"
                                      onClick={() => handleDeleteDoctor(doctorEntry.id)}
                                    >
                                      <FaTrashAlt /> Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {!loadingAttendance && !errorAttendance && activeTab === "attendance" && (
                  <div className="section-layout">
                    <div className="section-header">
                      <h1>Attendance Management</h1>
                      <p className="subtitle">Track and manage student attendance</p>
                    </div>

                    <div className="data-filters">
                      <div className="filter-group">
                        <select
                          className="filter-select"
                          value={selectedCourse || ""}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                          <option value="">Select Course</option>
                          {courses.map((course) => (
                            <option key={course.courseCode} value={course.courseCode}>
                              {course.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="action-buttons">
                        <button className="action-button">
                          <FaClipboardList /> Take Attendance
                        </button>
                        <button className="action-button secondary">
                          <FaFileAlt /> Export Report
                        </button>
                      </div>
                    </div>

                    {selectedCourse ? (
                      <div className="attendance-container">
                        <div className="attendance-overview">
                          {attendanceData
                            .getAttendanceMetrics(
                              attendanceData.getCourseAttendanceStats(attendanceStats, selectedCourse),
                            )
                            .map((metric, index) => (
                              <div key={index} className="attendance-stat-card">
                                <h3>{metric.title}</h3>
                                <div className="attendance-stat-value">{metric.value}</div>
                              </div>
                            ))}
                        </div>

                        <div className="attendance-sessions">
                          <h3>Attendance Sessions</h3>
                          <table className="data-table">
                            <thead>
                              <tr>
                                {attendanceData.getSessionTableColumns().map((column) => (
                                  <th key={column}>{column}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {attendanceData
                                .getCourseAttendanceStats(attendanceStats, selectedCourse)
                                ?.sessions?.map((session, index) => (
                                  <tr key={index}>
                                    <td>{session.date}</td>
                                    <td>{session.time}</td>
                                    <td>{session.location}</td>
                                    <td>{session.presentCount}</td>
                                    <td>{session.absentCount}</td>
                                    <td>
                                      <span
                                        className={`status-badge ${attendanceData.getAttendanceStatusClass(session.attendancePercentage)}`}
                                      >
                                        {session.attendancePercentage}%
                                      </span>
                                    </td>
                                    <td>
                                      <div className="table-actions">
                                        <button className="table-action-btn">View</button>
                                        <button className="table-action-btn">Edit</button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="no-course-selected">
                        <div className="no-data-message">
                          <FaBook className="no-data-icon" />
                          <h3>No Course Selected</h3>
                          <p>Please select a course to view attendance data</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!loadingSchedule && !errorSchedule && activeTab === "schedule" && (
                  <div className="section-layout">
                    <div className="section-header">
                      <h1>Teaching Schedule</h1>
                      <p className="subtitle">View and manage your teaching schedule</p>
                    </div>

                    <div className="schedule-calendar">
                      <div className="day-selector">
                        <button
                          className={`day-btn ${selectedDay === "All" ? "active" : ""}`}
                          onClick={() => setSelectedDay("All")}
                        >
                          All Days
                        </button>
                        {scheduleData.getDaysOfWeek().map((day) => (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`day-btn ${selectedDay === day ? "active" : ""}`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>

                      <div className="schedule-content">
                        {filteredSchedule.length === 0 ? (
                          <div className="no-classes">
                            <div className="no-classes-icon">📅</div>
                            <h3>No Classes Scheduled</h3>
                            <p>You have no classes scheduled for {selectedDay === "All" ? "any day" : selectedDay}.</p>
                          </div>
                        ) : (
                          <div className="timeline">
                            {filteredSchedule.map((session, index) => {
                              const timelineData = scheduleData.getTimelineItemData(session)
                              return (
                                <div key={index} className="timeline-item">
                                  <div className="timeline-day">{timelineData.day}</div>
                                  <div className="timeline-time">
                                    <span>{timelineData.startTime}</span>
                                    <span className="timeline-duration">{timelineData.duration}</span>
                                  </div>
                                  <div className="timeline-content">
                                    <div className="timeline-card">
                                      <h3>{timelineData.courseName}</h3>
                                      <div className="timeline-details">
                                        <span>
                                          <strong>Code:</strong> {timelineData.courseCode}
                                        </span>
                                        <span>
                                          <strong>Location:</strong> {timelineData.location}
                                        </span>
                                        <span>
                                          <strong>Students:</strong> {timelineData.studentsCount}
                                        </span>
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
                  </div>
                )}

                {!loadingProfile && !errorProfile && activeTab === "settings" && (
                  <div className="section-layout">
                    <div className="section-header">
                      <h1>Settings</h1>
                      <p className="subtitle">Manage your account preferences</p>
                    </div>

                    <div className="settings-container">
                      <div className="settings-section">
                        <h3>Account Settings</h3>
                        <div className="settings-group">
                          {settingsData.getAccountSettings().map((setting, index) => (
                            <div key={index} className="settings-item">
                              <div className="settings-item-info">
                                <h4>{setting.title}</h4>
                                <p>{setting.description}</p>
                              </div>
                              {setting.type === "toggle" ? (
                                <div className="toggle-switch">
                                  <input type="checkbox" id={setting.id} />
                                  <label htmlFor={setting.id}></label>
                                </div>
                              ) : (
                                <button className="settings-btn">{setting.action}</button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="settings-section">
                        <h3>Appearance</h3>
                        <div className="settings-group">
                          {settingsData.getAppearanceSettings().map((setting, index) => (
                            <div key={index} className="settings-item">
                              <div className="settings-item-info">
                                <h4>{setting.title}</h4>
                                <p>{setting.description}</p>
                              </div>
                              {setting.type === "toggle" ? (
                                <div className="toggle-switch">
                                  <input
                                    type="checkbox"
                                    id={setting.id}
                                    checked={setting.id === "darkMode" ? darkMode : false}
                                    onChange={setting.id === "darkMode" ? toggleDarkMode : undefined}
                                  />
                                  <label htmlFor={setting.id}></label>
                                </div>
                              ) : setting.type === "select" ? (
                                <select className="settings-select" value={language} onChange={toggleLanguage}>
                                  {setting.options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="settings-section">
                        <h3>Notifications</h3>
                        <div className="settings-group">
                          {settingsData.getNotificationSettings().map((setting, index) => (
                            <div key={index} className="settings-item">
                              <div className="settings-item-info">
                                <h4>{setting.title}</h4>
                                <p>{setting.description}</p>
                              </div>
                              <div className="toggle-switch">
                                <input type="checkbox" id={setting.id} defaultChecked={setting.defaultChecked} />
                                <label htmlFor={setting.id}></label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="settings-section">
                        <h3>API Settings</h3>
                        <div className="settings-group">
                          <div className="settings-item">
                            <div className="settings-item-info">
                              <h4>API URL</h4>
                              <p>Enter the backend API URL</p>
                            </div>
                            <input
                              type="text"
                              className="settings-input"
                              value={apiUrl}
                              onChange={(e) => setApiUrl(e.target.value)}
                              placeholder="e.g., http://localhost:3000/api"
                            />
                            <button className="settings-btn" onClick={loadData}>
                              Update API
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
