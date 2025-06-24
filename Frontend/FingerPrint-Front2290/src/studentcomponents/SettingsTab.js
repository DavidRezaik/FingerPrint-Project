"use client"

import { useLanguage } from "../contexts/LanguageContext"

function SettingsTab({
  darkMode,
  toggleDarkMode,
  language,
  handleLanguageToggle,
  setShowEditProfile,
  setShowChangePassword,
}) {
  const { t, isRTL } = useLanguage()

  return (
    <div className="section-layout">
      <div className="section-header">
        <h1>{t("Settings")}</h1>
        <p className="subtitle">{t("Manage your account preferences")}</p>
      </div>

      <div className="settings-container">
        <div className="settings-section">
          <h3>{t("Account Settings")}</h3>

          <div className="settings-group">
            <div className="settings-item">
              <div className="settings-item-info">
                <h4>{t("Profile Information")}</h4>
                <p>{t("Update your personal information")}</p>
              </div>
              <button
                className={`settings-btn ${isRTL ? "align-start-rtl" : ""}`}
                onClick={() => setShowEditProfile(true)}
              >
                {t("Edit")}
              </button>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <h4>{t("Change Password")}</h4>
                <p>{t("Update your password regularly for security")}</p>
              </div>
              <button className="settings-btn" onClick={() => setShowChangePassword(true)}>
                {t("Change")}
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>{t("Appearance")}</h3>

          <div className="settings-group">
            <div className="settings-item">
              <div className="settings-item-info">
                <h4>{t("Dark Mode")}</h4>
                <p>{t("Switch between light and dark themes")}</p>
              </div>
              <div className="toggle-switch">
                <input type="checkbox" id="darkMode" checked={darkMode} onChange={toggleDarkMode} />
                <label htmlFor="darkMode"></label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <h4>{t("Language")}</h4>
                <p>{t("Choose your preferred language")}</p>
              </div>
              <select className="settings-select" value={language} onChange={handleLanguageToggle}>
                <option value="english">{t("English")}</option>
                <option value="arabic">{t("العربية")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsTab
