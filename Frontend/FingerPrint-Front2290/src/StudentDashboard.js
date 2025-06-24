"use client"

import { useState, useRef } from "react"
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

  // Basic student info for header display
  const [student, setStudent] = useState({
    displayName: "Student Name",
    email: "student@example.com",
  })

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [userProfile, setUserProfile] = useState({})
  const [passwordInputs, setPasswordInputs] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

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

  const tabs = [
    { id: "dashboard", label: t("Dashboard"), icon: <FaHome /> },
    { id: "profile", label: t("Profile"), icon: <FaUser /> },
    { id: "courseAttendance", label: t("Course Attendance"), icon: <FaBook /> },
    { id: "fingerprintLog", label: t("Fingerprint Log"), icon: <FaFingerprint /> },
    { id: "schedule", label: t("Schedule"), icon: <FaCalendarAlt /> },
    { id: "notifications", label: t("Notifications"), icon: <FaBell /> },
    { id: "settings", label: t("Settings"), icon: <FaCog /> },
  ]

  const getBreadcrumbTitle = () => {
    const tab = tabs.find((t) => t.id === activeTab)
    return tab ? tab.label : ""
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab setActiveTab={setActiveTab} />
      case "profile":
        return <ProfileTab />
      case "courseAttendance":
        return <CourseAttendanceTab searchQuery={searchQuery} />
      case "fingerprintLog":
        return <FingerprintLogTab searchQuery={searchQuery} />
      case "schedule":
        return <ScheduleTab />
      case "notifications":
        return <NotificationsTab />
      case "settings":
        return (
          <SettingsTab
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            language={language}
            handleLanguageToggle={handleLanguageToggle}
            setShowEditProfile={setShowEditProfile}
            setShowChangePassword={setShowChangePassword}
          />
        )
      default:
        return <DashboardTab setActiveTab={setActiveTab} />
    }
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
                {renderActiveTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

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
    </div>
  )
}

export default StudentDashboard
