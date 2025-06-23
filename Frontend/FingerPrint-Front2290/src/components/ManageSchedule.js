import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import "../dashboard.css";

const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

function ManageSchedule() {
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [faculties, setFaculties] = useState([]);
  const [facultyYears, setFacultyYears] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);

  const [courses, setCourses] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState("");

  const [schedule, setSchedule] = useState([]);

  const [form, setForm] = useState({
    day: "Saturday",
    course: "",
    doctor: "",
    room: "",
    from: "",
    to: "",
  });

  const BASE_URL = "http://localhost:7069";

  useEffect(() => {
    fetch(`${BASE_URL}/api/Faculty/GetAllFaculty`)
      .then(res => res.json())
      .then(data => setFaculties(data))
      .catch(err => console.error("Error loading faculties:", err));

    fetch(`${BASE_URL}/api/FacultyYear/GetAllFacultyYear`)
      .then(res => res.json())
      .then(data => setFacultyYears(data))
      .catch(err => console.error("Error loading faculty years:", err));

    fetch(`${BASE_URL}/api/Subjects/GetAllSubjects`)
      .then(res => res.json())
      .then(data => {
        console.log("✅ Courses:", data);
        setCourses(data);
      })
      .catch(err => console.error("Error loading subjects:", err));

    fetch(`${BASE_URL}/api/Doctors/GetAllDoctors`)
      .then(res => res.json())
      .then(data => setDoctors(data))
      .catch(err => console.error("Error loading doctors:", err));

    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedFaculty) {
      const matchedFac = faculties.find(f => f.fac_Name === selectedFaculty);
      if (matchedFac) {
        const filtered = facultyYears.filter(y => y.facultyId === matchedFac.id);
        setFilteredYears(filtered);
        setSelectedYear("");
      }
    } else {
      setFilteredYears([]);
      setSelectedYear("");
    }
  }, [selectedFaculty, facultyYears]);

  const fetchRooms = () => {
    fetch(`${BASE_URL}/api/Rooms/GetAllRooms`)
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(err => console.error("Error loading rooms:", err));
  };

  const handleAdd = () => {
    const { course, doctor, room, from, to } = form;
    if (!selectedFaculty || !selectedYear || !course || !doctor || !room || !from || !to) {
      return alert("All fields are required");
    }

    const newEntry = {
      ...form,
      faculty: selectedFaculty,
      year: selectedYear,
      department: selectedFaculty
    };

    setSchedule([...schedule, newEntry]);
    setForm({ day: "Saturday", course: "", doctor: "", room: "", from: "", to: "" });
  };

  const handleAddRoom = async () => {
    if (!newRoom.trim()) return;

    const roomObj = { id: 0, room_Num: newRoom.trim() };

    try {
      const res = await fetch(`${BASE_URL}/api/Rooms/Add_OR_UpdateRoom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomObj),
      });

      if (res.ok) {
        setNewRoom("");
        fetchRooms();
      } else {
        alert("Failed to add room.");
      }
    } catch (error) {
      console.error("Error adding room:", error);
    }
  };

  const filteredSchedule = schedule.filter(
    (s) => s.year === selectedYear && s.faculty === selectedFaculty
  );

  return (
    <div className="section-layout">
      <div className="section-header">
        <h1>Manage Schedule</h1>
        <p className="subtitle">Set course times for each year, faculty, department, and room</p>
      </div>

      <div className="form-grid">
        <select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)}>
          <option value="" disabled>Select Faculty</option>
          {faculties.map((fac) => (
            <option key={fac.id} value={fac.fac_Name}>{fac.fac_Name}</option>
          ))}
        </select>

        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="" disabled>Select Year</option>
          {filteredYears.map((y) => (
            <option key={y.id} value={y.year}>{y.year}</option>
          ))}
        </select>

        <select name="day" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
          {daysOfWeek.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
  <option value="" disabled>Select Course</option>
  {courses.map((c, i) => (
    <option key={i} value={c.subName}>{c.subName}</option>
  ))}
</select>


        <select value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}>
          <option value="" disabled>Select Doctor</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.dr_NameAr}</option>
          ))}
        </select>

        <select value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}>
          <option value="" disabled>Select Room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.room_Num}>{room.room_Num}</option>
          ))}
        </select>

        <input type="time" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
        <input type="time" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />

        <button className="action-button" onClick={handleAdd}>
          <FaPlus /> Add to Schedule
        </button>
      </div>

      <div className="add-room-box">
        <h4>Add New Room</h4>
        <input
          type="text"
          value={newRoom}
          placeholder="Room Name/Number"
          onChange={(e) => setNewRoom(e.target.value)}
        />
        <button onClick={handleAddRoom}>Add Room</button>
      </div>

      <div className="data-table-container">
        {daysOfWeek.map((day) => (
          <div key={day} className="day-block">
            <h3>{day}</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Room</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Faculty</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedule.filter((s) => s.day === day).map((s, i) => (
                  <tr key={i}>
                    <td>{s.course}</td>
                    <td>{s.doctor}</td>
                    <td>{s.department}</td>
                    <td>{s.room}</td>
                    <td>{s.from}</td>
                    <td>{s.to}</td>
                    <td>{s.faculty}</td>
                    <td>{s.year}</td>
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
