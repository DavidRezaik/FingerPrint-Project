"use client"

import { FaChartBar, FaBook, FaFingerprint } from "react-icons/fa"

function DashboardTab({
  t,
  student,
  attendanceSummary,
  courses,
  fingerprintLogs,
  fingerprintTodayScanned,
  TimeTable,
  notifications,
  setActiveTab,
  handleFingerprintScan,
  isFingerprintScanning,
}) {
  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <h1>
          {t("Welcome back")}, {student.displayName}
        </h1>
        <p className="subtitle">{t("Here's what's happening with your academic progress")}</p>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-stats">
        {/* Attendance Card */}
        <div
          className="stat-card"
          onClick={() => setActiveTab("courseAttendance")}
          style={{ cursor: "pointer" }}
        >
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

        {/* Active Courses Card */}
        <div
          className="stat-card"
          onClick={() => {
            setActiveTab("courseAttendance")
            localStorage.setItem("courseFilter", "low") // ✅ فلتر تلقائي للـ "Low Attendance"
          }}
          style={{ cursor: "pointer" }}
        >
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

        {/* Fingerprint Status Card */}
        <div
          className="stat-card"
          onClick={() => setActiveTab("fingerprintLog")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon fingerprint">
            <FaFingerprint />
          </div>
          <div className="stat-info">
            <h3>{t("Fingerprint Status")}</h3>
            <div className="stat-value">
              {fingerprintTodayScanned ? t("Scanned Today") : t("Not Scanned")}
            </div>
            <div className="stat-detail">
              {!fingerprintTodayScanned && (
                <button
                  onClick={handleFingerprintScan}
                  className="scan-btn"
                  disabled={isFingerprintScanning}
                >
                  {isFingerprintScanning ? t("Scanning...") : t("Scan Now")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: Schedule + Notifications */}
      <div className="dashboard-row">
        {/* Today's Schedule */}
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
                      <p>{session.location} • {session.instructor}</p>
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="dashboard-col">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>{t("Recent Notifications")}</h3>
              <button className="view-all-btn" onClick={() => setActiveTab("notifications")}>
                {t("View All")}
              </button>
            </div>

            <div className="notification-list-compact">
              {notifications.slice(0, 3).map((note, index) => {
                const readIds = JSON.parse(localStorage.getItem("readNotifications") || "[]")
                const isRead = note.isRead || readIds.includes(note.id)

                return (
                  <div key={index} className={`notification-item-compact ${!isRead ? "unread" : ""}`}>
                    <div className="notification-content">
                      <h4 className="notification-title">{note.title || t("No Title")}</h4>
                      <p className="notification-message">{note.massage || t("No Message")}</p>
                      {note.date && (
                        <span className="notification-date">
                          {new Date(note.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardTab
