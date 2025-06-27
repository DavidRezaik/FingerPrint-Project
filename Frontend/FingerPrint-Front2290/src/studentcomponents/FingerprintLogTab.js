"use client"

import { useState, useEffect } from "react"
import { FaFingerprint } from "react-icons/fa"
import { fetchStudentProfile, fetchStudentAttendanceLogs, fetchTimeTable, matchFingerprint } from "../services/studentService"
import { useLanguage } from "../contexts/LanguageContext"

function FingerprintLogTab({ searchQuery }) {
  const { t } = useLanguage()
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [TimeTable, setTimeTable] = useState([])
  const [fingerprintTodayScanned, setFingerprintTodayScanned] = useState(false)
  const [isFingerprintScanning, setIsFingerprintScanning] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const email = localStorage.getItem("email")
        if (!email) return

        // جلب بيانات الطالب لمعرفة الاسم الإنجليزي
        const profile = await fetchStudentProfile(email)
        if (!profile || !profile.st_NameEn) return

        const studentName = profile.st_NameEn

        // جلب جميع سجلات الحضور
        const allAttendance = await fetchStudentAttendanceLogs()

        // فلترة الحضور بناء على الاسم الإنجليزي
        const studentAttendance = allAttendance.filter(
          record => record.st_NameEn && record.st_NameEn.trim().toLowerCase() === studentName.trim().toLowerCase()
        )
        setAttendanceRecords(studentAttendance)

        // جلب جدول المحاضرات (اختياري)
        const table = await fetchTimeTable(email)
        setTimeTable(table)

        // تحقق إذا كان الطالب حضر اليوم (لو يوجد حقل fingerTime يمثل اليوم)
        const today = new Date().toLocaleDateString("en-US", { weekday: "long" }) // مثل: "Sunday"
        const scannedToday = studentAttendance.some(
          record => record.fingerTime === today && record.atten
        )
        setFingerprintTodayScanned(scannedToday)
      } catch (error) {
        console.error("❌ Error loading attendance data:", error)
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

  // فلترة حسب البحث
  const filteredRecords = attendanceRecords.filter(record => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      record.sub_Name?.toLowerCase().includes(q) ||
      record.room_Num?.toLowerCase().includes(q) ||
      record.dr_NameEn?.toLowerCase().includes(q) ||
      (record.fingerTime || "").toLowerCase().includes(q)
    )
  })

  return (
    <div className="section-layout">
      <div className="section-header">
        <h1>{t("Attendance Records")}</h1>
        <p className="subtitle">{t("Track your attendance through fingerprint scans")}</p>
      </div>

      {!fingerprintTodayScanned && (
        <button onClick={handleFingerprintScan} className="action-button" disabled={isFingerprintScanning}>
          <FaFingerprint /> {isFingerprintScanning ? t("Scanning...") : t("Scan Fingerprint")}
        </button>
      )}

      <div className="data-table-container" style={{ marginTop: 15 }}>
        {filteredRecords.length === 0 ? (
          <div className="no-data-message">
            <p>{t("No attendance records found matching your search criteria.")}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("Subject")}</th>
                <th>{t("Doctor")}</th>
                <th>{t("Room")}</th>
                <th>{t("Day")}</th>
                <th>{t("Attendance")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.sub_Name}</td>
                  <td>{record.dr_NameEn}</td>
                  <td>{record.room_Num}</td>
                  <td>{record.fingerTime}</td>
                  <td>
                    <span className={`status-badge ${record.atten ? "success" : "error"}`}>
                      {record.atten ? t("Present") : t("Absent")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default FingerprintLogTab
