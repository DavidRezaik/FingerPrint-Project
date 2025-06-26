import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSyncAlt } from "react-icons/fa";
import "../dashboard.css";

const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const dayToNumber = { Saturday: 1, Sunday: 2, Monday: 3, Tuesday: 4, Wednesday: 5, Thursday: 6 };
const numberToDay = { 1: "Saturday", 2: "Sunday", 3: "Monday", 4: "Tuesday", 5: "Wednesday", 6: "Thursday" };

function ManageSchedule() {
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [facultyYears, setFacultyYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [form, setForm] = useState({
    day: "Saturday",
    course: "",
    from: "",
    to: "",
  });

  const BASE_URL = "http://localhost:7069";

  useEffect(() => {
    fetch(`${BASE_URL}/api/Faculty/GetAllFaculty`).then(res => res.json()).then(setFaculties);
    fetch(`${BASE_URL}/api/FacultyYear/GetAllFacultyYear`).then(res => res.json()).then(setFacultyYears);
    fetch(`${BASE_URL}/api/Subjects/GetAllSubjects`).then(res => res.json()).then(setCourses);
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    const res = await fetch(`${BASE_URL}/api/Lecture/GetAllLecture`);
    const data = await res.json();
    setSchedule(data);
  };

  const resetFilters = () => {
    setSelectedFaculty("");
    setSelectedYear("");
    setSelectedDay("");
    setSelectedCourse("");
  };

  const getCourseObj = (sub_ID) => courses.find(c => c.id === sub_ID);

  // Apply filters only if selected
  const filteredSchedule = schedule
    .filter(s => {
      const course = getCourseObj(s.sub_ID);
      if (!course) return false;
      return (
        (!selectedFaculty || course.faculty === selectedFaculty) &&
        (!selectedYear || course.year === selectedYear) &&
        (!selectedDay || numberToDay[s.day] === selectedDay) &&
        (!selectedCourse || course.id === parseInt(selectedCourse))
      );
    });

  // Grouped by Faculty -> Year -> Day
  const grouped = {};
  filteredSchedule.forEach((s) => {
    const course = getCourseObj(s.sub_ID);
    if (!course) return;
    if (!grouped[course.faculty]) grouped[course.faculty] = {};
    if (!grouped[course.faculty][course.year]) grouped[course.faculty][course.year] = {};
    if (!grouped[course.faculty][course.year][s.day]) grouped[course.faculty][course.year][s.day] = [];
    grouped[course.faculty][course.year][s.day].push({ ...s, course });
  });

  // ترتيب الكورسات داخل اليوم حسب fromTime
  Object.keys(grouped).forEach(fac =>
    Object.keys(grouped[fac]).forEach(yr =>
      Object.keys(grouped[fac][yr]).forEach(day =>
        grouped[fac][yr][day].sort((a, b) => a.fromTime.localeCompare(b.fromTime))
      )
    )
  );

  const filteredCourses =
    selectedFaculty && selectedYear
      ? courses.filter(c => c.faculty === selectedFaculty && c.year === selectedYear)
      : courses;

  const handleAdd = async () => {
    const { course, from, to, day } = form;
    if (!course || !from || !to) return alert("All fields are required");
    const selectedSubject = courses.find(c => c.id === parseInt(course));
    if (!selectedSubject || !selectedSubject.id) {
      alert("Invalid subject selected");
      return;
    }
    const payload = {
      id: 0,
      sub_ID: selectedSubject.id,
      day: dayToNumber[day],
      fromTime: `${from}:00`,
      toTime: `${to}:00`,
    };
    const res = await fetch(`${BASE_URL}/api/Lecture/Add_OR_UpdateLecture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      loadSchedule();
      setForm({ day: "Saturday", course: "", from: "", to: "" });
    } else {
      const err = await res.json();
      alert("Failed to save lecture: " + (err.message || ""));
    }
  };

  const handleDelete = async (lectureId) => {
    const confirmed = window.confirm("Delete this lecture?");
    if (!confirmed) return;
    await fetch(`${BASE_URL}/api/Lecture/DeleteLecture?id=${lectureId}`, { method: "DELETE" });
    loadSchedule();
  };

  return (
    <div className="section-layout">
      <div className="section-header">
        <h1>Manage Schedule</h1>
        <p className="subtitle">Add & view lectures, filter by faculty, year, day or course.</p>
      </div>

      {/* --- Fields Grid (wide) --- */}
      <div className="add-fields-wide">
        <select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
          {daysOfWeek.map((d, idx) => <option key={idx} value={d}>{d}</option>)}
        </select>
        <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}>
          <option value="" disabled>Select Course</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.subName}</option>
          ))}
        </select>
        <input type="time" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} />
        <input type="time" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} />
        <button className="action-button" onClick={handleAdd}><FaPlus /> Add Lecture</button>
      </div>

      {/* --- Filters --- */}
      <div className="filters-bar-wide">
        <select value={selectedFaculty} onChange={e => { setSelectedFaculty(e.target.value); setSelectedYear(""); }}>
          <option value="">All Faculties</option>
          {faculties.map(f => <option key={f.id} value={f.fac_Name}>{f.fac_Name}</option>)}
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
          <option value="">All Years</option>
          {facultyYears
            .filter(y => !selectedFaculty || faculties.find(f => f.id === y.facultyId)?.fac_Name === selectedFaculty)
            .map(y => <option key={y.id} value={y.year}>{y.year}</option>)}
        </select>
        <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
          <option value="">All Days</option>
          {daysOfWeek.map((d, idx) => <option key={idx} value={d}>{d}</option>)}
        </select>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
          <option value="">All Courses</option>
          {filteredCourses.map(c => (
            <option key={c.id} value={c.id}>{c.subName}</option>
          ))}
        </select>
        <button className="reset-btn" onClick={resetFilters}><FaSyncAlt /> Reset</button>
      </div>

      {/* --- جدول Grouped --- */}
      <div className="grouped-schedule-table">
        {Object.keys(grouped).length === 0 ? (
          <div className="no-data-message">No lectures found.</div>
        ) : (
          Object.entries(grouped).map(([faculty, years]) => (
            <div key={faculty} className="faculty-block">
              <h2 className="faculty-title">{faculty}</h2>
              {Object.entries(years).map(([year, days]) => (
                <div key={year} className="year-block">
                  <h3 className="year-title">{year}</h3>
                  {daysOfWeek.map((dayName, dayIdx) => {
                    const dayNum = dayToNumber[dayName];
                    const lectures = days[dayNum] || [];
                    if (lectures.length === 0) return null;
                    return (
                      <div key={dayName} className="day-block">
                        <h4 className="day-title">{dayName}</h4>
                        <table className="schedule-table">
                          <thead>
                            <tr>
                              <th>Course</th>
                              <th>From</th>
                              <th>To</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lectures.map((s) => (
                              <tr key={s.id}>
                                <td>{s.course?.subName}</td>
                                <td>{s.fromTime}</td>
                                <td>{s.toTime}</td>
                                <td>
                                  <button className="delete-btn" onClick={() => handleDelete(s.id)} title="Delete">
                                    <FaTrash />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <style>{`
        .add-fields-wide, .filters-bar-wide {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 18px;
          margin-bottom: 18px;
          align-items: center;
        }
        .filters-bar-wide select, .add-fields-wide select, .add-fields-wide input {
          padding: 7px 14px;
          border-radius: 9px;
          border: 1px solid #c8c8c8;
          min-width: 120px;
        }
        .add-fields-wide input[type="time"] {
          min-width: 90px;
        }
        .schedule-table {
          border-collapse: collapse;
          width: 100%;
          margin: 10px 0 28px 0;
          background: #fff;
          box-shadow: 0 2px 10px #eee;
          border-radius: 11px;
        }
        .schedule-table th, .schedule-table td {
          padding: 10px 13px;
          text-align: center;
        }
        .schedule-table th { background: #f6f6f6; font-weight: bold; }
        .schedule-table tbody tr:nth-child(even) { background: #fafaff; }
        .action-button, .reset-btn, .delete-btn {
          background: #1771ee; color: #fff; border: none;
          border-radius: 7px; padding: 7px 13px; font-size: 15px;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .reset-btn { background: #8b8b8b; }
        .delete-btn { background: #e33a3a; }
        .faculty-title { color: #1771ee; margin-bottom: 6px; border-left: 5px solid #1771ee; padding-left: 8px; font-size: 1.25rem;}
        .year-title { color: #2e2e2e; margin-bottom: 2px; border-left: 3px solid #aaa; padding-left: 10px; font-size: 1.1rem;}
        .day-title { color: #555; margin-top: 9px; font-size: 1.01rem;}
        .faculty-block, .year-block, .day-block { margin-bottom: 7px;}
        .no-data-message { text-align: center; color: #999; padding: 30px;}
      `}</style>
    </div>
  );
}

export default ManageSchedule;
