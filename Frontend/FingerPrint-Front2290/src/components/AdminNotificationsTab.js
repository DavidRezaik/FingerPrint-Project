import React, { useState, useEffect } from "react";
import "../dashboard.css";
import config from "../config";
import { showSuccess, showError } from "../utils/toast";

function AdminNotificationTab() {
  const [notifications, setNotifications] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [facultyYears, setFacultyYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);
  const [filteredSemesters, setFilteredSemesters] = useState([]);
  const [form, setForm] = useState({
    title: "",
    message: "",
    departmentId: "",
    yearId: "",
    semesterId: "",
  });

  const BASE_URL = config.BASE_URL;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [facRes, yearRes, semRes, notiRes] = await Promise.all([
          fetch(`${BASE_URL}/api/Faculty/GetAllFaculty`),
          fetch(`${BASE_URL}/api/FacultyYear/GetAllFacultyYear`),
          fetch(`${BASE_URL}/api/FacultyYearSemister/GetAllSemisters`),
          fetch(`${BASE_URL}/api/Notification/GetAllNotifications`),
        ]);

        const [facData, yearData, semData, notiData] = await Promise.all([
          facRes.json(),
          yearRes.json(),
          semRes.json(),
          notiRes.json(),
        ]);

        setFaculties(facData);
        setFacultyYears(yearData);
        setSemesters(semData);
        setNotifications(notiData);
      } catch (error) {
        console.error("Fetch error:", error);
        showError("❌ Failed to load initial data");
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (form.departmentId) {
      const filtered = facultyYears.filter(
        (y) => y.facultyId === parseInt(form.departmentId)
      );
      setFilteredYears(filtered);
      setForm((prev) => ({ ...prev, yearId: "", semesterId: "" }));
    }
  }, [form.departmentId, facultyYears]);

  useEffect(() => {
    if (form.yearId) {
      const filtered = semesters.filter(
        (s) => s.facultyYearId === parseInt(form.yearId)
      );
      setFilteredSemesters(filtered);
    }
  }, [form.yearId, semesters]);

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim() || !form.semesterId) {
      showError("Please fill all fields.");
      return;
    }

    const semesterId = parseInt(form.semesterId);
    if (isNaN(semesterId)) {
      showError("Semester selection is invalid.");
      return;
    }

    const dto = {
      id: 0,
      title: form.title.trim(),
      massage: form.message.trim(),
      facYearSem_ID: semesterId,
      facultyYearSemister: ""
    };

    try {
      const res = await fetch(`${BASE_URL}/api/Notification/AddNotifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dto),
      });

      const result = await res.json();

      if (!res.ok) {
        const errorMsg = result?.message || JSON.stringify(result) || "Unknown error";
        showError("❌ Failed: " + errorMsg);
        return;
      }

      showSuccess("✅ Notification sent successfully");

      setForm({ title: "", message: "", departmentId: "", yearId: "", semesterId: "" });
      setFilteredYears([]);
      setFilteredSemesters([]);

      const updated = await fetch(`${BASE_URL}/api/Notification/GetAllNotifications`);
      const data = await updated.json();
      setNotifications(data);
    } catch (error) {
      console.error("Send Error:", error);
      showError("❌ Failed to send notification");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/Notification/DeleteRoom?id=${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result?.message || "Delete failed");
      }

      showSuccess("✅ Notification deleted");
      const updated = await fetch(`${BASE_URL}/api/Notification/GetAllNotifications`);
      const data = await updated.json();
      setNotifications(data);
    } catch (err) {
      console.error("Delete error:", err);
      showError("❌ Failed to delete");
    }
  };

  const getFullSemesterDetails = (id) => {
    const semester = semesters.find((s) => s.id === id);
    if (!semester) return { sem_Name: "N/A", year: "N/A", department: "N/A" };

    const yearObj = facultyYears.find((y) => y.id === semester.facultyYearId);
    const department = faculties.find((f) => f.id === yearObj?.facultyId);

    return {
      sem_Name: semester.sem_Name,
      year: yearObj?.year || "N/A",
      department: department?.fac_Name || "N/A",
    };
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Send Notification to Students</h3>
        <p className="subtitle">Send announcements based on academic year and department</p>
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            placeholder="Enter notification title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Department</label>
          <select
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
          >
            <option value="" disabled hidden>Select Department</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>{f.fac_Name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Academic Year</label>
        <select
          value={form.yearId}
          onChange={(e) => setForm({ ...form, yearId: e.target.value })}
        >
          <option value="" disabled hidden>Select Year</option>
          {filteredYears.map((y) => (
            <option key={y.id} value={y.id}>{y.year}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Semester</label>
        <select
          value={form.semesterId}
          onChange={(e) => setForm({ ...form, semesterId: e.target.value })}
        >
          <option value="" disabled hidden>Select Semester</option>
          {filteredSemesters.map((s) => (
            <option key={s.id} value={s.id}>{s.sem_Name}</option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ marginTop: "20px" }}>
        <label>Message</label>
        <textarea
          rows="4"
          placeholder="Write your message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      <button className="action-button" onClick={handleSend}>
        Send Notification
      </button>

      <h3 style={{ marginTop: "30px" }}>Sent Notifications</h3>

      <ul className="notification-list">
        {notifications.map((n) => {
          const details = getFullSemesterDetails(n.facYearSem_ID);
          return (
            <li key={n.id} className="notification-item">
              <strong>{n.title}</strong><br />
              <p><strong>Message:</strong> {n.massage}</p>
              <p><strong>Semester:</strong> {details.sem_Name}</p>
              <p><strong>Academic Year:</strong> {details.year}</p>
              <p><strong>Department:</strong> {details.department}</p>
              <button
                onClick={() => handleDelete(n.id)}
                style={{
                  backgroundColor: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  padding: "5px 10px",
                  cursor: "pointer",
                  marginTop: "10px"
                }}
              >
                Delete
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default AdminNotificationTab;