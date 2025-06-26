"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaUser,
  FaBook,
  FaFingerprint,
  FaCalendarAlt,
  FaBell,
  FaCog,
  FaBars,
  FaMoon,
  FaSun,
  FaChevronDown,
  FaGlobe,
  FaEdit,
  FaKey,
  FaSignOutAlt,
  FaSearch,
  FaHome,
} from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
import {
  fetchStudentProfile,
  fetchTimeTable,
  fetchAttendanceSummary,
  fetchFingerprintLogs,
  matchFingerprint,
  fetchCourseAttendance,
  fetchStudentNotifications,
} from "./services/studentService"

import "./dashboard.css"
import { useLanguage } from "./contexts/LanguageContext"
import EditProfileModal from "./components/EditProfileModal"
import ChangePasswordModal from "./components/ChangePasswordModal"
import DashboardTab from "./studentcomponents/DashboardTab"
import ProfileTab from "./studentcomponents/ProfileTab"
import CourseAttendanceTab from "./studentcomponents/CourseAttendanceTab"
import FingerprintLogTab from "./studentcomponents/FingerprintLogTab"
import ScheduleTab from "./studentcomponents/ScheduleTab"
import NotificationsTab from "./studentcomponents/NotificationsTab"
import SettingsTab from "./studentcomponents/SettingsTab"
import config from "./config"

const BASE_URL = config.BASE_URL

function StudentDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [collapsed, setCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "english"
  })
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const profileDropdownRef = useRef(null)
  const { t, isRTL, toggleLanguage } = useLanguage()

  // Student data states
  const [student, setStudent] = useState({})
  const [TimeTable, setTimeTable] = useState([])
  const [attendanceSummary, setAttendanceSummary] = useState({})
  const [fingerprintLogs, setFingerprintLogs] = useState([])
  const [fingerprintTodayScanned, setFingerprintTodayScanned] = useState(false)
  const [courses, setCourses] = useState([])
  const [activeDay, setActiveDay] = useState(() => {
    return new Date().toLocaleDateString("en-US", { weekday: "long" })
  })
  const [notifications, setNotifications] = useState([])

  const [isFingerprintScanning, setIsFingerprintScanning] = useState(false)
  const [logResultFilter, setLogResultFilter] = useState("all")
  const [logLocationFilter, setLogLocationFilter] = useState("all")
  const [courseFilter, setCourseFilter] = useState("all")

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

        // جلب بيانات الطالب
        const profileData = await fetchStudentProfile(email)
        if (!profileData) {
          console.log("ℹ️ No profile data returned")
          return
        }

        const apiData = Array.isArray(profileData) ? profileData[0] : profileData

        setStudent({
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
        })

        // جلب الكورسات المرتبطة بسنة/سمستر الطالب فقط
        const allCoursesRes = await fetch(`${BASE_URL}/api/Subjects/GetAllSubjects`)
        const allCourses = await allCoursesRes.json()
        const myCourses = allCourses.filter(
          (c) => Number(c.facYearSem_ID) === Number(apiData.facYearSem_ID)
        )
        setCourses(myCourses)

        // باقي البيانات
        const [table, summary, logs] = await Promise.all([
          fetchTimeTable(email),
          fetchAttendanceSummary(),
          fetchFingerprintLogs(),
        ])
        setTimeTable(table)
        setAttendanceSummary(summary)
        setFingerprintLogs(logs)

        // إشعارات الطالب
        const notificationsList = await fetchStudentNotifications(apiData.facYearSem_ID)
        setNotifications(notificationsList)

        // تحقق من مسح البصمة اليوم
        const today = new Date().toISOString().slice(0, 10)
        const scannedToday = logs.some((log) => log.date === today && log.result === "Success")
        setFingerprintTodayScanned(scannedToday)
      } catch (error) {
        console.error("❌ Error loading student data:", error)
      }
    }

    loadData()
  }, [])

  const handleEditProfile = () => {
    setUserProfile({
      name: student.displayName || "",
      email: student.email || "",
    })
    setShowEditProfile(true)
    setProfileDropdownOpen(false)
  }

  const handleChangePassword = () => {
    setShowChangePassword(true)
    setProfileDropdownOpen(false)
  }

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [userProfile, setUserProfile] = useState({})
  const [passwordInputs, setPasswordInputs] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleGenerateReport = () => {
    const reportData = {
      student: student.displayName,
      totalCourses: courses.length,
      attendanceRate: attendanceSummary.percentage,
      date: new Date().toLocaleDateString(),
    }

    alert(
      `Attendance Report Generated:\n\nStudent: ${reportData.student}\nAttendance Rate: ${reportData.attendanceRate}%\nTotal Courses: ${reportData.totalCourses}`,
    )
  }

  const handleMarkNotificationRead = (index) => {
    const updated = [...notifications]
    const note = updated[index]

    updated[index].isRead = !note.isRead
    setNotifications(updated)

    const key = "readNotifications"
    let stored = JSON.parse(localStorage.getItem(key) || "[]")

    if (updated[index].isRead) {
      stored = [...new Set([...stored, note.id])]
    } else {
      stored = stored.filter((id) => id !== note.id)
    }

    localStorage.setItem(key, JSON.stringify(stored))
  }

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  const handleLogout = () => {
    if (window.confirm(t("Are you sure you want to logout?"))) {
      navigate("/")
    }
  }

  const toggleDarkMode = () => setDarkMode(!darkMode)

  const handleLanguageToggle = () => {
    const newLanguage = language === "english" ? "arabic" : "english"
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
    toggleLanguage()
  }

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

  const tabs = [
    { id: "dashboard", label: t("Dashboard"), icon: <FaHome /> },
    { id: "profile", label: t("Profile"), icon: <FaUser /> },
    { id: "courses", label: t("Courses"), icon: <FaBook /> },
    { id: "fingerprintLog", label: t("Fingerprint Log"), icon: <FaFingerprint /> },
    { id: "schedule", label: t("Schedule"), icon: <FaCalendarAlt /> },
    {
      id: "notifications",
      label: t("Notifications"),
      icon: <FaBell />,
      badge: notifications.filter((n) => !n.isRead).length,
    },
    { id: "settings", label: t("Settings"), icon: <FaCog /> },
  ]

  const getBreadcrumbTitle = () => {
    const tab = tabs.find((t) => t.id === activeTab)
    return tab ? tab.label : ""
  }

  const filteredLogs = fingerprintLogs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.result.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesResult =
      logResultFilter === "all" || log.result.toLowerCase() === logResultFilter.toLowerCase()

    const matchesLocation =
      logLocationFilter === "all" || log.location.toLowerCase().includes(logLocationFilter.toLowerCase())

    return matchesSearch && matchesResult && matchesLocation
  })

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

  const commonProps = {
    t,
    isRTL,
    student,
    TimeTable,
    attendanceSummary,
    fingerprintLogs,
    fingerprintTodayScanned,
    courses,
    activeDay,
    setActiveDay,
    notifications,
    setNotifications,
    isFingerprintScanning,
    logResultFilter,
    setLogResultFilter,
    logLocationFilter,
    setLogLocationFilter,
    courseFilter,
    setCourseFilter,
    searchQuery,
    filteredLogs,
    filteredCourses,
    handleFingerprintScan,
    handleGenerateReport,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
    setActiveTab,
    darkMode,
    toggleDarkMode,
    language,
    handleLanguageToggle,
    setShowEditProfile,
    setShowChangePassword,
  }

  return (
    <div className={`layout ${darkMode ? "dark-mode" : ""} ${isRTL ? "rtl" : "ltr"}`}>
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo"> 🎓 Akhbar El-Youm Academy</h2>
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
            {!collapsed && <span>{darkMode ? t("Light Mode") : t("Dark Mode")}</span>}
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
                placeholder={t("Search...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="header-right" ref={profileDropdownRef}>
            <div className="profile-dropdown" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
              <div className="profile-info">
                <div className="profile-avatar">{student.displayName?.charAt(0) || "S"}</div>
                <span className="profile-name">{student.displayName}</span>
                <FaChevronDown className="dropdown-icon" />
              </div>

              {profileDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{student.displayName?.charAt(0) || "S"}</div>
                    <div className="dropdown-user-info">
                      <h4>{student.displayName}</h4>
                      <p>{student.email}</p>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-item" onClick={handleEditProfile}>
                    <FaEdit className="dropdown-item-icon" />
                    <span>{t("Edit Profile")}</span>
                  </div>

                  <div className="dropdown-item" onClick={handleChangePassword}>
                    <FaKey className="dropdown-item-icon" />
                    <span>{t("Change Password")}</span>
                  </div>

                  <div className="dropdown-item" onClick={handleLanguageToggle}>
                    <FaGlobe className="dropdown-item-icon" />
                    <span>{language === "english" ? "العربية" : "English"}</span>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-item logout" onClick={handleLogout}>
                    <FaSignOutAlt className="dropdown-item-icon" />
                    <span>{t("Logout")}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          <div className="breadcrumb">
            <span className="breadcrumb-item">{t("Home")}</span>
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
                {showEditProfile && (
                  <EditProfileModal
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    onClose={() => setShowEditProfile(false)}
                  />
                )}

                {showChangePassword && (
                  <ChangePasswordModal
                    inputs={passwordInputs}
                    setInputs={setPasswordInputs}
                    onClose={() => setShowChangePassword(false)}
                    onSuccess={() => {
                      alert("Password updated successfully.")
                      setShowChangePassword(false)
                    }}
                  />
                )}

                {activeTab === "dashboard" && <DashboardTab {...commonProps} />}
                {activeTab === "profile" && <ProfileTab {...commonProps} />}
                {activeTab === "courses" && <CourseAttendanceTab {...commonProps} />}
                {activeTab === "fingerprintLog" && <FingerprintLogTab {...commonProps} />}
                {activeTab === "schedule" && <ScheduleTab {...commonProps} />}
                {activeTab === "notifications" && <NotificationsTab {...commonProps} />}
                {activeTab === "settings" && <SettingsTab {...commonProps} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
