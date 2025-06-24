"use client"

import { FaFingerprint } from "react-icons/fa"

function ProfileTab({ t, student, handleFingerprintScan, isFingerprintScanning }) {
  return (
    <div className="profile-layout">
      <div className="profile-header">
        <div className="profile-avatar-large">{student.displayName?.charAt(0) || "S"}</div>
        <div className="profile-header-info">
          <h1>{student.displayName}</h1>
          <p>
            {student.department} • {student.year} {t("Year")}
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
              <label>{t("GPA")}</label>
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
                  <button onClick={handleFingerprintScan} className="register-btn" disabled={isFingerprintScanning}>
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
