"use client"

import { useState, useEffect } from "react"
import { FaPlus, FaTrash, FaEdit, FaDoorOpen, FaTimes } from "react-icons/fa"
import "../dashboard.css"
import { useLanguage } from "../contexts/LanguageContext"
import { showSuccess, showError } from "../utils/toast"
import config from "../config"

function CourseManagement() {
  const [courses, setCoursesData] = useState([])
  const [form, setForm] = useState({
    id: 0,
    name: "",
    code: "",
    departmentId: "",
    semesterId: "",
    yearId: "",
    doctorId: "",
    roomId: ""
  })
  const [rooms, setRooms] = useState([])
  const [departments, setDepartments] = useState([])
  const [facultyYears, setFacultyYears] = useState([])
  const [semesters, setSemesters] = useState([])
  const [filteredYears, setFilteredYears] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [filteredSemesters, setFilteredSemesters] = useState([])
  const [doctors, setDoctors] = useState([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [newRoom, setNewRoom] = useState("")
  const [isAddingRoom, setIsAddingRoom] = useState(false)

  const { t } = useLanguage()
  const BASE_URL = config.BASE_URL

  // Helper: map each course to have roomName always
  const mapCoursesWithRoomNames = (subjectData, roomsData) => {
    return subjectData.map(course => {
      let roomName = "";
      if (course.rooms && course.rooms.room_Num) {
        roomName = course.rooms.room_Num;
      } else if (course.room_Num) {
        roomName = course.room_Num;
      } else if (course.roomNum) {
        roomName = course.roomNum;
      } else if (course.room_ID) {
        const found = roomsData.find(r => r.id === course.room_ID);
        if (found) roomName = found.room_Num;
      }
      return { ...course, roomName };
    });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [deptRes, yearsRes, semRes, docRes, subjectRes, roomsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/Faculty/GetAllFaculty`),
          fetch(`${BASE_URL}/api/FacultyYear/GetAllFacultyYear`),
          fetch(`${BASE_URL}/api/FacultyYearSemister/GetAllSemisters`),
          fetch(`${BASE_URL}/api/Doctors/GetAllDoctors`),
          fetch(`${BASE_URL}/api/Subjects/GetAllSubjects`),
          fetch(`${BASE_URL}/api/Rooms/GetAllRooms`)
        ])

        const [deptData, yearsData, semData, docData, subjectData, roomsData] = await Promise.all([
          deptRes.json(), yearsRes.json(), semRes.json(), docRes.json(), subjectRes.json(), roomsRes.json()
        ])

        setDepartments(deptData)
        setFacultyYears(yearsData)
        setSemesters(semData)
        setDoctors(docData)
        setRooms(roomsData)
        // map courses with room name
        setCoursesData(mapCoursesWithRoomNames(subjectData, roomsData))
      } catch {
        showError("❌ Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (form.departmentId) {
      setFilteredYears(facultyYears.filter(y => y.facultyId === parseInt(form.departmentId)))
      setFilteredDoctors(doctors.filter(d => d.fac_ID === parseInt(form.departmentId)))
    } else {
      setFilteredYears([])
      setFilteredDoctors([])
    }
    setForm(prev => ({ ...prev, yearId: "", semesterId: "", doctorId: "" }))
  }, [form.departmentId, facultyYears, doctors])

  useEffect(() => {
    if (form.yearId) {
      setFilteredSemesters(semesters.filter(s => s.facultyYearId === parseInt(form.yearId)))
    } else {
      setFilteredSemesters([])
    }
  }, [form.yearId, semesters])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setForm({ id: 0, name: "", code: "", departmentId: "", yearId: "", semesterId: "", doctorId: "", roomId: "" })
    setIsEditMode(false)
  }

  const handleAddOrUpdate = async () => {
    if (!form.name?.trim() || !form.code?.trim() || !form.departmentId || !form.yearId || !form.semesterId || !form.doctorId || !form.roomId) {
      return showError(t("Please fill all required fields"))
    }

    const duplicate = courses.find(c =>
      ((c.sub_Name || c.subName || "").toLowerCase()) === (form.name?.toLowerCase() || "") && c.id !== form.id
    )

    if (duplicate) {
      return showError(t("Course with same name already exists"))
    }

    const dto = {
      id: form.id,
      sub_Code: form.code,
      sub_Name: form.name,
      dr_ID: parseInt(form.doctorId),
      facYearSem_ID: parseInt(form.semesterId),
      room_ID: parseInt(form.roomId)
    }

    try {
      const res = await fetch(`${BASE_URL}/api/Subjects/Add_OR_UpdateSubject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result?.message || "Save failed")

      showSuccess(isEditMode ? t("Course updated successfully") : t("Course added successfully"))
      resetForm()
      // fetch all again to update mapping roomName
      const [subjectRes, roomsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/Subjects/GetAllSubjects`),
        fetch(`${BASE_URL}/api/Rooms/GetAllRooms`)
      ])
      const [subjectData, roomsData] = await Promise.all([subjectRes.json(), roomsRes.json()])
      setCoursesData(mapCoursesWithRoomNames(subjectData, roomsData))
      setRooms(roomsData)
    } catch (error) {
      showError("❌ Failed to save course")
    }
  }

  const handleEdit = (course) => {
    const foundDoctor = doctors.find(d => d.dr_NameAr === course.doctor || d.dr_NameEn === course.doctor || (course.doctors && d.id === course.doctors.id));
    const foundSemester = semesters.find(s => s.sem_Name === course.semister || (course.facultyYearSemister && s.id === course.facultyYearSemister.id));
    const foundYear = facultyYears.find(y => y.year === course.year || (course.facultyYearSemister && y.id === course.facultyYearSemister.facYear_Id));
    const foundDept = departments.find(d => d.fac_Name === course.faculty);
    // غرفة مختارة (يدعم room_ID أو rooms.id)
    const foundRoom = rooms.find(r =>
      r.room_Num === course.roomNum ||
      r.room_Num === course.room_Num ||
      r.id === course.room_ID ||
      (course.rooms && r.id === course.rooms.id)
    );

    setForm({
      id: course.id,
      name: course.sub_Name || course.subName || "",
      code: course.sub_Code || course.subCode || "",
      departmentId: foundDept?.id?.toString() || "",
      yearId: foundYear?.id?.toString() || "",
      semesterId: foundSemester?.id?.toString() || "",
      doctorId: foundDoctor?.id?.toString() || "",
      roomId: foundRoom?.id?.toString() || ""
    });
    setIsEditMode(true);
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return
    try {
      await fetch(`${BASE_URL}/api/Subjects/DeleteSubject?id=${id}`, { method: 'DELETE' })
      showSuccess("🗑️ Course deleted")
      // fetch all again to update mapping
      const [subjectRes, roomsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/Subjects/GetAllSubjects`),
        fetch(`${BASE_URL}/api/Rooms/GetAllRooms`)
      ])
      const [subjectData, roomsData] = await Promise.all([subjectRes.json(), roomsRes.json()])
      setCoursesData(mapCoursesWithRoomNames(subjectData, roomsData))
      setRooms(roomsData)
    } catch {
      showError("❌ Failed to delete course")
    }
  }

  // ---- Room add logic ----
  const handleAddRoom = async (e) => {
    e.preventDefault()
    if (!newRoom.trim()) return showError(t("Please enter a room number"))
    setIsAddingRoom(true)
    try {
      const res = await fetch(`${BASE_URL}/api/Rooms/Add_OR_UpdateRoom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: 0, room_Num: newRoom.trim() })
      })
      if (!res.ok) throw new Error("Failed to add room")
      showSuccess(t("Room added successfully"))
      setNewRoom("")
      setShowAddRoom(false)
      const roomsRes = await fetch(`${BASE_URL}/api/Rooms/GetAllRooms`)
      setRooms(await roomsRes.json())
    } catch {
      showError(t("Failed to add room"))
    }
    setIsAddingRoom(false)
  }

  // ---- Delete Room logic ----
  const handleDeleteRoom = async (id) => {
    if (!window.confirm(t("Are you sure you want to delete this room?"))) return
    try {
      await fetch(`${BASE_URL}/api/Rooms/DeleteRoom?id=${id}`, { method: "DELETE" })
      showSuccess(t("Room deleted"))
      const updatedRooms = await fetch(`${BASE_URL}/api/Rooms/GetAllRooms`)
      setRooms(await updatedRooms.json())
    } catch {
      showError(t("Failed to delete room"))
    }
  }

  // فلترة الكورسات بالبحث
  const filteredCourses = courses.filter(c => {
    const name = (c.sub_Name || c.subName || "").toLowerCase()
    const doctor = (c.doctors?.dr_NameEn || c.doctor || "").toLowerCase()
    return name.includes(searchTerm.toLowerCase()) || doctor.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="section-layout">
      <div className="section-header">
        <h1>{t("Manage Courses")}</h1>
        <p className="subtitle">{t("Add and assign courses to doctors")}</p>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <input
          placeholder="🔍 Search by name or doctor"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "8px" }}
        />
      </div>

      {/* --- Course Form --- */}
      <div className="form-grid">
        <input name="name" placeholder={t("Course Name")} value={form.name} onChange={handleChange} />
        <input name="code" placeholder={t("Course Code")} value={form.code} onChange={handleChange} />

        <select name="departmentId" value={form.departmentId} onChange={handleChange}>
          <option value="" disabled hidden>{t("Select Department")}</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.fac_Name}</option>
          ))}
        </select>

        <select name="yearId" value={form.yearId} onChange={handleChange}>
          <option value="" disabled hidden>{t("Select Year")}</option>
          {filteredYears.map(y => (
            <option key={y.id} value={y.id}>{y.year}</option>
          ))}
        </select>

        <select name="semesterId" value={form.semesterId} onChange={handleChange}>
          <option value="" disabled hidden>{t("Select Semester")}</option>
          {filteredSemesters.map(s => (
            <option key={s.id} value={s.id}>{s.sem_Name}</option>
          ))}
        </select>

        <select name="doctorId" value={form.doctorId} onChange={handleChange}>
          <option value="" disabled hidden>{t("Assign Doctor")}</option>
          {filteredDoctors.map(d => (
            <option key={d.id} value={d.id}>{d.dr_NameEn} - {d.dr_Email}</option>
          ))}
        </select>

        {/* Room Dropdown + Add Room button */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            name="roomId"
            value={form.roomId}
            onChange={handleChange}
            style={{ flex: 1 }}
          >
            <option value="" disabled hidden>{t("Assign Room")}</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>{r.room_Num}</option>
            ))}
          </select>
          <button
            type="button"
            className="icon-btn"
            style={{
              background: "#eaf3fb",
              border: "1px solid #b7d4ed",
              color: "#1976d2",
              fontSize: 16,
              padding: 6,
              borderRadius: "50%",
              cursor: "pointer"
            }}
            onClick={() => setShowAddRoom(v => !v)}
            title={t("Add Room")}
          >
            <FaPlus />
          </button>
        </div>

        <button className="action-button" onClick={handleAddOrUpdate} type="button">
          <FaPlus /> {isEditMode ? t("Update Course") : t("Add Course")}
        </button>
      </div>

      {/* Show add room box under the dropdown */}
      {showAddRoom && (
        <div className="add-room-box" style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          padding: 16,
          margin: "12px 0 20px 0",
          maxWidth: 400
        }}>
          <form style={{ display: "flex", gap: 8, alignItems: "center" }} onSubmit={handleAddRoom}>
            <input
              type="text"
              placeholder={t("Enter room number")}
              value={newRoom}
              onChange={e => setNewRoom(e.target.value)}
              style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
              disabled={isAddingRoom}
            />
            <button
              type="submit"
              className="action-button"
              style={{ padding: "8px 14px" }}
              disabled={isAddingRoom}
            >
              <FaDoorOpen /> {t("Add")}
            </button>
            <button
              type="button"
              style={{
                background: "#eee",
                border: "none",
                borderRadius: "50%",
                fontSize: 16,
                color: "#666",
                padding: 6,
                marginLeft: 2,
                cursor: "pointer"
              }}
              onClick={() => setShowAddRoom(false)}
              title={t("Close")}
            >
              <FaTimes />
            </button>
          </form>
          {/* --- جدول/قائمة بالغرف مع زرار حذف --- */}
          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 8, fontSize: 15, color: "#1976d2" }}>{t("Rooms List")}</h4>
            <ul style={{ padding: 0, margin: 0 }}>
              {rooms.length === 0 && (
                <li style={{ color: "#888", fontSize: 13 }}>{t("No rooms available")}</li>
              )}
              {rooms.map(r => (
                <li key={r.id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  borderBottom: "1px solid #f3f3f3"
                }}>
                  <span style={{ fontWeight: 500 }}>{r.room_Num}</span>
                  <button
                    style={{
                      background: "#ffe7e7",
                      color: "#e74c3c",
                      border: "none",
                      borderRadius: "50%",
                      padding: "3px 7px",
                      fontSize: 13,
                      marginLeft: 12,
                      cursor: "pointer"
                    }}
                    title={t("Delete Room")}
                    onClick={() => handleDeleteRoom(r.id)}
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* --- Course Table --- */}
      <div className="data-table-container">
        {isLoading ? (
          <p className="no-data-message">⏳ Loading courses...</p>
        ) : filteredCourses.length === 0 ? (
          <p className="no-data-message">{t("No courses found.")}</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("Name")}</th>
                <th>{t("Doctor")}</th>
                <th>{t("Year")}</th>
                <th>{t("Semester")}</th>
                <th>{t("Room")}</th>
                <th>{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course, index) => (
                <tr key={index}>
                  <td>{course.sub_Name || course.subName || ""}</td>
                  <td>
                    {course.doctors
                      ? `${course.doctors.dr_NameEn || ""} (${course.doctors.dr_Email || ""})`
                      : course.doctor || "-"}
                  </td>
                  <td>
                    {course.facultyYearSemister?.facultyYear?.year ||
                      course.year ||
                      "-"}
                  </td>
                  <td>
                    {course.facultyYearSemister?.sem_Name ||
                      course.semister ||
                      "-"}
                  </td>
                  <td>
                    {course.roomName || "-"}
                  </td>
                  <td>
                    <button onClick={() => handleEdit(course)} className="edit-button" title={t("Edit Course")}><FaEdit /></button>
                    <button onClick={() => handleDelete(course.id)} className="delete-button" title={t("Delete Course")}><FaTrash /></button>
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

export default CourseManagement
