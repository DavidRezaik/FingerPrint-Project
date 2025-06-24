"use client"

function NotificationsTab({ t, notifications, handleMarkNotificationRead, handleMarkAllNotificationsRead }) {
  return (
    <div className="section-layout">
      <div className="section-header">
        <h1>{t("Notifications")}</h1>
        <p className="subtitle">{t("Stay updated with important announcements")}</p>
      </div>

      <div className="notifications-container">
        <div className="notifications-header">
          <div className="notifications-count">
            {notifications.filter((n) => !n.isRead).length} {t("unread notifications")}
          </div>
          <button className="mark-all-read" onClick={handleMarkAllNotificationsRead}>
            {t("Mark all as read")}
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="no-data-message">
            <p>{t("No notifications at the moment.")}</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((note, index) => (
              <div key={index} className={`notification-card ${!note.isRead ? "unread" : ""}`}>
                <div className="notification-indicator"></div>
                <div className="notification-content">
                  <p className="notification-message">{note.message}</p>
                  <span className="notification-date">{note.date}</span>
                </div>
                <div className="notification-actions">
                  <button className="notification-action mark-read" onClick={() => handleMarkNotificationRead(index)}>
                    {note.isRead ? t("Mark as unread") : t("Mark as read")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsTab
