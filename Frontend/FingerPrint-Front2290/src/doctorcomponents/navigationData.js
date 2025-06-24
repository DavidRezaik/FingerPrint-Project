import {
  FaUser,
  FaBook,
  FaCalendarAlt,
  FaCog,
  FaGlobe,
  FaEdit,
  FaKey,
  FaSignOutAlt,
  FaHome,
  FaClipboardList,
  FaChalkboardTeacher,
  FaUsers,
} from "react-icons/fa"

// Navigation and tabs configuration
export const navigationData = {
  // Main navigation tabs
  getTabs: () => [
    { id: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { id: "profile", label: "Profile", icon: <FaUser /> },
    { id: "courses", label: "Courses", icon: <FaBook /> },
    { id: "students", label: "Students", icon: <FaUsers /> },
    { id: "doctors-management", label: "Doctors", icon: <FaChalkboardTeacher /> },
    { id: "attendance", label: "Attendance", icon: <FaClipboardList /> },
    { id: "schedule", label: "Schedule", icon: <FaCalendarAlt /> },
    { id: "settings", label: "Settings", icon: <FaCog /> },
  ],

  // Get breadcrumb title based on active tab
  getBreadcrumbTitle: (activeTab, tabs) => {
    const tab = tabs.find((t) => t.id === activeTab)
    return tab ? tab.label : ""
  },

  // Profile dropdown menu items
  getProfileDropdownItems: () => [
    { icon: <FaEdit />, label: "Edit Profile" },
    { icon: <FaKey />, label: "Change Password" },
    { icon: <FaGlobe />, label: "Language", action: "toggleLanguage" },
    { divider: true },
    { icon: <FaSignOutAlt />, label: "Logout", action: "logout", className: "logout" },
  ],
}
