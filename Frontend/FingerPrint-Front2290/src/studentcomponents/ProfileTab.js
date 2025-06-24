"use client"

import { useState, useEffect } from "react"
import { FaFingerprint } from "react-icons/fa"
import {
  fetchStudentProfile,
  fetchAllSemesters,
  fetchAllFacultyYears,
  fetchAllFaculties,
  matchFingerprint
} from "../services/studentService"
import { useLanguage } from "../contexts/LanguageContext"

function ProfileTab() {
  const { t } = useLanguage()

  const [student, setStudent] = useState({})
  const [isFingerprintScanning, setIsFingerprintScanning] = useState(false)

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

        const profileData = await fetchStudentProfile(email)
        if (!profileData) return

        const apiData = Array.isArray(profileData) ? profileData[0] : profileData

        // 🔁 Fetch the mapping data
        const [semesters, facultyYears, faculties] = await Promise.all([
          fetchAllSemesters(),
          fetchAllFacultyYears(),
          fetchAllFaculties()
        ])

        const currentSemester = semesters.find(s => s.id === apiData.facYearSem_ID)
        const facultyYear = facultyYears.find(fy => fy.id === currentSemester?.facultyYearId)
        const faculty = faculties.find(f => f.id === facultyYear?.facultyId)

        const mappedStudent = {
          id: apiData.id,
          displayName: apiData.st_NameEn || apiData.st_NameAr || "Unknown",
          st_NameAr: apiData.st_NameAr,
          st_NameEn: apiData.st_NameEn,
          email: apiData.st_Email,
          studentCode: apiData.st_Code,
          phone: apiData.phone,
          year: facultyYear?.year || "Unknown",
          department: faculty?.fac_Name || "Unknown",
          gpa: currentSemester?.sem_Name || "Unknown",
          fingerprintRegistered: apiData.fingerID > 0,
          fingerID: apiData.fingerID,
          st_Image: apiData.st_Image,
          facYearSem_ID: apiData.facYearSem_ID,
        }

        setStudent(mappedStudent)
      } catch (error) {
        console.error("❌ Error loading student data:", error)
      }
    }

    loadData()
  }, [])

  const handleFingerprintScan = async () => {
    setIsFingerprintScanning(true)
    try {
      const result = await matchFingerprint()
      alert(result.message)
    } catch (error) {
      alert(t("Failed to scan fingerprint."))
      console.error(error)
    } finally {
      setIsFingerprintScanning(false)
    }
  }

  return (
    <div className="profile-layout">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {student.displayName?.charAt(0) || "S"}
        </div>
        <div className="profile-header-info">
          <h1>{student.displayName}</h1>
          <p>
            {student.department} • {student.year}
          </p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>{t("Personal Information")}</h3>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <label>{t("Full Name")}</label>
              <p>{student.displayName}</p>
            </div>
            <div className="profile-info-item">
              <label>{t("Email Address")}</label>
              <p>{student.email}</p>
            </div>
            <div className="profile-info-item">
              <label>{t("Student ID")}</label>
              <p>{student.id || "N/A"}</p>
            </div>
            <div className="profile-info-item">
              <label>{t("Phone Number")}</label>
              <p>{student.phone || t("Not provided")}</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>{t("Academic Information")}</h3>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <label>{t("Department")}</label>
              <p>{student.department}</p>
            </div>
            <div className="profile-info-item">
              <label>{t("Academic Year")}</label>
              <p>{student.year}</p>
            </div>
            <div className="profile-info-item">
              <label>{t("Semester")}</label>
              <p>{student.gpa}</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>{t("Fingerprint Status")}</h3>
          <div className="fingerprint-status">
            {student.fingerprintRegistered ? (
              <div className="fingerprint-registered">
                <FaFingerprint className="fingerprint-icon" />
                <div>
                  <h4>{t("Fingerprint Registered")}</h4>
                  <p>{t("Your fingerprint is registered in the system.")}</p>
                </div>
              </div>
            ) : (
              <div className="fingerprint-not-registered">
                <FaFingerprint className="fingerprint-icon" />
                <div>
                  <h4>{t("Fingerprint Not Registered")}</h4>
                  <p>{t("Please register your fingerprint for attendance tracking.")}</p>
                  <button
                    onClick={handleFingerprintScan}
                    className="register-btn"
                    disabled={isFingerprintScanning}
                  >
                    {isFingerprintScanning ? t("Scanning...") : t("Register Now")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileTab
