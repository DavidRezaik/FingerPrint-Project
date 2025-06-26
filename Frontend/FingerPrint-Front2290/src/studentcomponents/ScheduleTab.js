"use client"

import { useState, useEffect } from "react"
import { fetchTimeTable } from "../services/studentService"
import { useLanguage } from "../contexts/LanguageContext"

function ScheduleTab() {
  const { t } = useLanguage()

  const [TimeTable, setTimeTable] = useState([])
  const [activeDay, setActiveDay] = useState(() => {
    return new Date().toLocaleDateString("en-US", { weekday: "long" })
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const userString = localStorage.getItem("email");
        if (!userString) return;

        let email = null;
        try {
          const parsed = JSON.parse(userString);
          email = typeof parsed === "object" && parsed.email ? parsed.email : parsed;
        } catch {
          email = userString;
        }

        if (!email || email.trim() === "") return;

        const table = await fetchTimeTable(email);
        setTimeTable(table);

        if (table.length > 0) {
          setActiveDay(table[0].day);
        }
      } catch (error) {
        console.error("❌ Error loading schedule data:", error);
      }
    };

    loadData();
  }, []);

  const allDays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  return (
    <div className="section-layout">
      <div className="section-header">
        <h1>{t("Weekly Schedule")}</h1>
        <p className="subtitle">{t("View your class schedule for the week")}</p>
      </div>

      <div className="schedule-calendar">
        <div className="day-selector">
          {allDays.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`day-btn ${activeDay === day ? "active" : ""}`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="schedule-content">
          {(() => {
            const daySessions = TimeTable.filter((session) => session.day === activeDay)
            daySessions.sort((a, b) => {
              const parseTime = (time) => {
                let [h, m] = time.split(":").map(Number);
                return h * 60 + m;
              }
              return parseTime(a.time.split(" - ")[0]) - parseTime(b.time.split(" - ")[0])
            })

            if (daySessions.length === 0) {
              return (
                <div className="no-classes">
                  <div className="no-classes-icon">🎉</div>
                  <h3>{t("No Classes Scheduled")}</h3>
                  <p>
                    {t("You have no classes scheduled for")} {activeDay}.
                  </p>
                </div>
              )
            }

            return (
              <div className="timeline">
                {daySessions.map((session, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-time">
                      <span>{session.time.split(" - ")[0]}</span>
                      <span className="timeline-duration">{session.time.split(" - ")[1]}</span>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-card">
                        <h3>{session.course}</h3>
                        <div className="timeline-details">
                          <span>
                            <strong>{t("Code")}:</strong> {session.courseCode}
                          </span>
                          <span>
                            <strong>{t("Instructor")}:</strong> {session.instructor || "TBD"}
                          </span>
                          <span>
                            <strong>{t("Room")}:</strong> {session.location || t("Main Campus")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default ScheduleTab
