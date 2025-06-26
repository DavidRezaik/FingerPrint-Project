// ✅ This version of ManageSchedule is connected to backend (GET/POST/DELETE) with correct day number mapping and unique keys
import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import "../dashboard.css";

const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

const dayToNumber = {
  Saturday: 1,
  Sunday: 2,
  Monday: 3,
  Tuesday: 4,
  Wednesday: 5,
  Thursday: 6
};

const numberToDay = {
  1: "Saturday",
  2: "Sunday",
  3: "Monday",
  4: "Tuesday",
  5: "Wednesday",
  6: "Thursday"
};

function ManageSchedule() {
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [facultyYears, setFacultyYears] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [newRoom, setNewRoom] = useState("");

  const [form, setForm] = useState({
    day: "Saturday",
    course: "",
    doctor: "",
    room: "",
    from: "",
    to: ""
  });

  const BASE_URL = "http://localhost:7069";

  const timeStringToTicks = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return ((hours * 60 + minutes) * 60 * 10000000);
  };

  useEffect(() => {
    fetch(`${BASE_URL}/api/Faculty/GetAllFaculty`).then(res => res.json()).then(setFaculties);
    fetch(`${BASE_URL}/api/FacultyYear/GetAllFacultyYear`).then(res => res.json()).then(setFacultyYears);
    fetch(`${BASE_URL}/api/Subjects/GetAllSubjects`).then(res => res.json()).then(setCourses);
    fetch(`${BASE_URL}/api/Doctors/GetAllDoctors`).then(res => res.json()).then(setDoctors);
    fetch(`${BASE_URL}/api/Rooms/GetAllRooms`).then(res => res.json()).then(setRooms);
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    const res = await fetch(`${BASE_URL}/api/Lecture/GetAllLecture`);
    const data = await res.json();
    setSchedule(data);
  };

  useEffect(() => {
    if (selectedFaculty) {
      const fac = faculties.find(f => f.fac_Name === selectedFaculty);
      if (fac) {
        const filtered = facultyYears.filter(y => y.facultyId === fac.id);
        setFilteredYears(filtered);
        setSelectedYear("");
      }
    } else {
      setFilteredYears([]);
      setSelectedYear("");
    }
  }, [selectedFaculty, facultyYears]);

  const handleAdd = async () => {
    const { course, from, to, day } = form;
    if (!selectedFaculty || !selectedYear || !course || !from || !to)
      return alert("All fields are required");

    const selectedSubject = courses.find(c => c.subName === course);
    if (!selectedSubject) return alert("Invalid subject selected");

    const payload = {
      id: 0,
      lecture_Name: `${course} - ${day}`,
      sub_ID: selectedSubject.id,
      day: dayToNumber[day],
      fromTime: { ticks: timeStringToTicks(from) },
      toTime: { ticks: timeStringToTicks(to) }
    };

    const res = await fetch(`${BASE_URL}/api/Lecture/Add_OR_UpdateLecture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      loadSchedule();
      setForm({ day: "Saturday", course: "", doctor: "", room: "", from: "", to: "" });
    } else {
      const err = await res.json();
      console.error("Save error:", err);
      alert("Failed to save lecture");
    }
  };

  const handleDelete = async (lectureId) => {
    const confirmed = window.confirm("Delete this lecture?");
    if (!confirmed) return;
    await fetch(`${BASE_URL}/api/Lecture/DeleteLecture?id=${lectureId}`, { method: "DELETE" });
    loadSchedule();
  };

  const filteredSchedule = schedule.filter(s => {
    const subject = courses.find(c => c.id === s.sub_ID);
    return subject && facultyYears.find(y => y.id === subject.facYearSem_ID)?.year === selectedYear
      && faculties.find(f => f.id === facultyYears.find(y => y.id === subject.facYearSem_ID)?.facultyId)?.fac_Name === selectedFaculty;
  });

  return (
    <div className="section-layout">
      <div className="section-header">
        <h1>Manage Schedule</h1>
        <p className="subtitle">Set course times for each year, faculty, department, and room</p>
      </div>

      <div className="form-grid">
        <select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)}>
          <option value="" disabled>Select Faculty</option>
          {faculties.map(f => <option key={f.id} value={f.fac_Name}>{f.fac_Name}</option>)}
        </select>

        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="" disabled>Select Year</option>
          {filteredYears.map(y => <option key={y.id} value={y.year}>{y.year}</option>)}
        </select>

        <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
          {daysOfWeek.map((d, index) => <option key={index} value={d}>{d}</option>)}
        </select>

        <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
          <option value="" disabled>Select Course</option>
          {courses.map((c) => <option key={c.id} value={c.subName}>{c.subName}</option>)}
        </select>

        <input type="time" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
        <input type="time" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />

        <button className="action-button" onClick={handleAdd}>
          <FaPlus /> Add Lecture
        </button>
      </div>

      <div className="data-table-container">
        {daysOfWeek.map((day, dayIndex) => (
          <div key={dayIndex} className="day-block">
            <h3>{day}</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedule.filter(s => numberToDay[s.day] === day).map((s) => (
                  <tr key={s.id}>
                    <td>{s.subjects}</td>
                    <td>{new Date(s.fromTime.ticks / 10000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td>{new Date(s.toTime.ticks / 10000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td>
                      <button onClick={() => handleDelete(s.id)}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageSchedule;
