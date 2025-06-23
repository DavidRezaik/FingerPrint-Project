"use client"

import { useState, useEffect } from "react"
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa"
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
  })
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

  const { t } = useLanguage()
  const BASE_URL = config.BASE_URL

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [deptRes, yearsRes, semRes, docRes, subjectRes] = await Promise.all([
          fetch(`${BASE_URL}/api/Faculty/GetAllFaculty`),
          fetch(`${BASE_URL}/api/FacultyYear/GetAllFacultyYear`),
          fetch(`${BASE_URL}/api/FacultyYearSemister/GetAllSemisters`),
          fetch(`${BASE_URL}/api/Doctors/GetAllDoctors`),
          fetch(`${BASE_URL}/api/Subjects/GetAllSubjects`)
        ])

        const [deptData, yearsData, semData, docData, subjectData] = await Promise.all([
          deptRes.json(), yearsRes.json(), semRes.json(), docRes.json(), subjectRes.json()
        ])

        setDepartments(deptData)
        setFacultyYears(yearsData)
        setSemesters(semData)
        setDoctors(docData)
        setCoursesData(subjectData)
      } catch {
        showError("❌ Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
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
    setForm({ id: 0, name: "", code: "", departmentId: "", yearId: "", semesterId: "", doctorId: "" })
    setIsEditMode(false)
  }

  const handleAddOrUpdate = async () => {
    if (!form.name?.trim() || !form.code?.trim() || !form.departmentId || !form.yearId || !form.semesterId || !form.doctorId) {
      return showError(t("Please fill all required fields"))
    }

    const duplicate = courses.find(c =>
      (c?.sub_Name?.toLowerCase() || "") === (form.name?.toLowerCase() || "") && c.id !== form.id
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
  room_ID: 1 // مؤقتًا
}


    console.log("DTO being sent:", dto)

    try {
      const res = await fetch(`${BASE_URL}/api/Subjects/Add_OR_UpdateSubject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
      })

      const result = await res.json()
      console.log("API response:", result)

      if (!res.ok) throw new Error(result?.message || "Save failed")

      showSuccess(isEditMode ? t("Course updated successfully") : t("Course added successfully"))
      resetForm()
      const updatedCourses = await fetch(`${BASE_URL}/api/Subjects/GetAllSubjects`)
      const updatedData = await updatedCourses.json()
      setCoursesData(updatedData)
    } catch (error) {
      console.error("Save Error:", error)
      showError("❌ Failed to save course")
    }
  }

  const handleEdit = (course) => {
  const foundDoctor = doctors.find(d => d.dr_NameAr === course.doctor || d.dr_NameEn === course.doctor);
  const foundSemester = semesters.find(s => s.sem_Name === course.semister);
  const foundYear = facultyYears.find(y => y.year === course.year);
  const foundDept = departments.find(d => d.fac_Name === course.faculty);

  setForm({
    id: course.id,
    name: course.sub_Name,
    code: course.sub_Code,
    departmentId: foundDept?.id?.toString() || "",
    yearId: foundYear?.id?.toString() || "",
    semesterId: foundSemester?.id?.toString() || "",
    doctorId: foundDoctor?.id?.toString() || ""
  });

  setIsEditMode(true);
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return
    try {
      await fetch(`${BASE_URL}/api/Subjects/DeleteSubject?id=${id}`, { method: 'DELETE' })
      showSuccess("🗑️ Course deleted")
      const updatedCourses = await fetch(`${BASE_URL}/api/Subjects/GetAllSubjects`)
      const updatedData = await updatedCourses.json()
      setCoursesData(updatedData)
    } catch {
      showError("❌ Failed to delete course")
    }
  }

  const filteredCourses = courses.filter(c => {
    const name = c.sub_Name?.toLowerCase() || ""
    const doctor = c.doctors?.dr_NameEn?.toLowerCase() || ""
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

        <button className="action-button" onClick={handleAddOrUpdate}>
          <FaPlus /> {isEditMode ? t("Update Course") : t("Add Course")}
        </button>
      </div>

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
                <th>{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course, index) => (
                <tr key={index}>
                <td>{course.subName}</td>
                <td>{course.doctor}</td>
                <td>{course.year}</td>
                <td>{course.semister}</td>

                  <td>
                    <button onClick={() => handleEdit(course)} className="edit-button"><FaEdit /></button>
                    <button onClick={() => handleDelete(course.id)} className="delete-button"><FaTrash /></button>
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

export default CourseManagement;