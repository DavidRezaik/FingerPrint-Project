"use client"

import { useState, useEffect } from "react"
import { FaFingerprint } from "react-icons/fa"
import { fetchFingerprintLogs, fetchTimeTable, matchFingerprint } from "../services/studentService"
import { useLanguage } from "../contexts/LanguageContext"

function FingerprintLogTab({ searchQuery }) {
  const { t } = useLanguage()

  const [fingerprintLogs, setFingerprintLogs] = useState([])
  const [TimeTable, setTimeTable] = useState([])
  const [fingerprintTodayScanned, setFingerprintTodayScanned] = useState(false)
  const [isFingerprintScanning, setIsFingerprintScanning] = useState(false)
  const [logResultFilter, setLogResultFilter] = useState("all")
  const [logLocationFilter, setLogLocationFilter] = useState("all")

  useEffect(() => {
    const loadData = async () => {
      try {
        const userString = localStorage.getItem("email")
        if (!userString) return

        let email = null
        try {
          const parsed = JSON.parse(userString)
          email = typeof parsed === "object" && parsed.email ? parsed.email : parsed
        } catch {
          email = userString
        }

        if (!email || email.trim() === "") return

        const [logs, table] = await Promise.all([fetchFingerprintLogs(), fetchTimeTable(email)])

        setFingerprintLogs(logs)
        setTimeTable(table)

        const today = new Date().toISOString().slice(0, 10)
        const scannedToday = logs.some((log) => log.date === today && log.result === "Success")
        setFingerprintTodayScanned(scannedToday)
      } catch (error) {
        console.error("❌ Error loading fingerprint log data:", error)
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

  const filteredLogs = fingerprintLogs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.result.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesResult = logResultFilter === "all" || log.result.toLowerCase() === logResultFilter.toLowerCase()

    const matchesLocation =
      logLocationFilter === "all" || log.location.toLowerCase().includes(logLocationFilter.toLowerCase())

    return matchesSearch && matchesResult && matchesLocation
  })

  return (
    <div className="section-layout">
      <div className="section-header">
        <h1>{t("Fingerprint Log")}</h1>
        <p className="subtitle">{t("Track your attendance records")}</p>
      </div>

      <div className="data-filters">
        <div className="filter-group">
          <select
            className="filter-select"
            value={logResultFilter}
            onChange={(e) => setLogResultFilter(e.target.value)}
          >
            <option value="all">{t("All Results")}</option>
            <option value="success">{t("Success")}</option>
            <option value="failed">{t("Failed")}</option>
          </select>

          <select
            className="filter-select"
            value={logLocationFilter}
            onChange={(e) => setLogLocationFilter(e.target.value)}
          >
            <option value="all">{t("All Locations")}</option>
            <option value="main">{t("Main Campus")}</option>
            <option value="lab">{t("Lab Building")}</option>
            <option value="library">{t("Library")}</option>
          </select>
        </div>

        {!fingerprintTodayScanned && (
          <button onClick={handleFingerprintScan} className="action-button" disabled={isFingerprintScanning}>
            <FaFingerprint /> {isFingerprintScanning ? t("Scanning...") : t("Scan Fingerprint")}
          </button>
        )}
      </div>

      <div className="data-table-container">
        {filteredLogs.length === 0 ? (
          <div className="no-data-message">
            <p>{t("No fingerprint logs found matching your search criteria.")}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("Date")}</th>
                <th>{t("Time")}</th>
                <th>{t("Location")}</th>
                <th>{t("Course")}</th>
                <th>{t("Code")}</th>
                <th>{t("Result")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => {
                const matchedCourse =
                  TimeTable.find(
                    (t) =>
                      t.courseCode === log.courseCode &&
                      t.day === new Date(log.date).toLocaleDateString("en-US", { weekday: "long" }),
                  ) || {}
                return (
                  <tr key={index}>
                    <td>{log.date}</td>
                    <td>{log.time}</td>
                    <td>{log.location}</td>
                    <td>{matchedCourse.course || "N/A"}</td>
                    <td>{log.courseCode || "N/A"}</td>
                    <td>
                      <span className={`status-badge ${log.result === "Success" ? "success" : "error"}`}>
                        {log.result}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default FingerprintLogTab
