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
  // 🟢 تحديد هل البصمة متسجلة حسب fingerID
  const isScanned =
    student &&
    student.fingerID !== undefined &&
    student.fingerID !== null &&
    student.fingerID !== 0 &&
    student.fingerID !== "0"

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
            setActiveTab("courseAttendanceTab")
            localStorage.setItem("courseFilter", "low")
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon courses">
            <FaBook />
          </div>
          <div className="stat-info">
            <h3>{t("Active Courses")}</h3>
            <div className="stat-value">{courses.length}</div>
            {/* فقط عرض رسالة لو لا يوجد مواد */}
            <div className="stat-detail" style={{ fontSize: 14, color: "#444", marginTop: 5 }}>
              {courses.length === 0 && <span>{t("No active courses")}</span>}
            </div>
            <div className="stat-detail" style={{ color: "#e87c13", marginTop: 3 }}>
              {
                courses.filter((c) => {
                  const logsForCourse = fingerprintLogs.filter((log) => log.courseCode === c.courseCode)
                  const successLogs = logsForCourse.filter((log) => log.result === "Success").length
                  const totalSessions = logsForCourse.length || 1
                  const attendancePercent = Math.round((successLogs / totalSessions) * 100)
                  return attendancePercent < 75
                }).length
              }
              {" "}{t("need attention")}
            </div>
          </div>
        </div>

        {/* Fingerprint Status Card */}
        <div
          className="stat-card"
          onClick={() => {
            if (!isScanned) setActiveTab("fingerprintLog")
          }}
          style={{
            cursor: !isScanned ? "pointer" : "default",
            border: !isScanned ? "2px dashed #f26b51" : undefined,
            background: !isScanned ? "#fff8f3" : undefined,
          }}
        >
          <div className="stat-icon fingerprint">
            <FaFingerprint />
          </div>
          <div className="stat-info">
            <h3>{t("Fingerprint Status")}</h3>
            <div
              className="stat-value"
              style={{
                color: isScanned ? "#21a75c" : "#e87c13",
              }}
            >
              {isScanned ? t("Scanned") : t("Not Scanned")}
            </div>
            <div className="stat-detail">
              {!isScanned && (
                <div style={{ marginTop: 10 }}>
                  <span style={{ color: "#e87c13" }}>
                    {t("You have not registered your fingerprint yet.")}
                  </span>
                  <br />
                </div>
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
