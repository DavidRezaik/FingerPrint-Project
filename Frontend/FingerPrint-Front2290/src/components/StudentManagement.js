import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaTrash, FaEdit, FaKey } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './StudentManagement.css';
import config from "../config"

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [studentNameEn, setStudentNameEn] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);

  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedFacultyYearId, setSelectedFacultyYearId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");

  const [faculties, setFaculties] = useState([]);
  const [facultyYears, setFacultyYears] = useState([]);
  const [filteredFacultyYears, setFilteredFacultyYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [filteredSemesters, setFilteredSemesters] = useState([]);

  const [filterFaculty, setFilterFaculty] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const BASE_URL = config.BASE_URL;

  const fetchData = async () => {
    try {
      const studentsRes = await fetch(`${BASE_URL}/api/Studets/GetAllStudets`);
      const studentsData = await studentsRes.json();
      setStudents(studentsData);

      const facultiesRes = await fetch(`${BASE_URL}/api/Faculty/GetAllFaculty`);
      const facultiesData = await facultiesRes.json();
      setFaculties(facultiesData);

      const yearsRes = await fetch(`${BASE_URL}/api/FacultyYear/GetAllFacultyYear`);
      const yearsData = await yearsRes.json();
      setFacultyYears(yearsData);

      const semRes = await fetch(`${BASE_URL}/api/FacultyYearSemister/GetAllSemisters`);
      const semData = await semRes.json();
      setSemesters(semData);

    } catch {
      toast.error("❌ Failed to load initial data");
    }
  };

  useEffect(() => {
    fetchData();
    resetForm();
  }, []);

  useEffect(() => {
    if (selectedFacultyId) {
      const filtered = facultyYears.filter(fy => fy.facultyId === parseInt(selectedFacultyId));
      setFilteredFacultyYears(filtered);
    } else {
      setFilteredFacultyYears([]);
    }
    setSelectedFacultyYearId("");
    setSelectedSemesterId("");
  }, [selectedFacultyId, facultyYears]);

  useEffect(() => {
    if (selectedFacultyYearId) {
      const filtered = semesters.filter(s => s.facultyYearId === parseInt(selectedFacultyYearId));
      setFilteredSemesters(filtered);
    } else {
      setFilteredSemesters([]);
    }
    setSelectedSemesterId("");
  }, [selectedFacultyYearId, semesters]);

  const getFacultyNameById = (id) => faculties.find(f => f.id === parseInt(id))?.fac_Name || "";
  const getFacultyYearStringById = (id) => facultyYears.find(f => f.id === parseInt(id))?.year || "";
  const getSemesterNameById = (id) => semesters.find(s => s.id === parseInt(id))?.sem_Name || "";

  const getFacultyNameBySemId = (semId) => {
    const sem = semesters.find(s => s.id === semId);
    const facultyYear = facultyYears.find(y => y.id === sem?.facultyYearId);
    const faculty = faculties.find(f => f.id === facultyYear?.facultyId);
    return faculty?.fac_Name || "";
  };

  const generatePassword = () => {
    const facultyCode = getFacultyNameById(selectedFacultyId).split(" ")[2] || "Dept";
    return `${studentCode}${studentNameEn.split(" ")[0]}${facultyCode}@#$`;
  };

  const addOrUpdateStudent = async () => {
    if (!studentCode || !studentNameEn || !studentEmail || !selectedFacultyId || !selectedFacultyYearId || !selectedSemesterId) {
      toast.warning("Please fill in all required fields");
      return;
    }

    if (!studentPassword || studentPassword.length < 6) {
      toast.error("❌ Password must be at least 6 characters");
      return;
    }

    const codeExists = students.some(s => s.st_Code === studentCode && s.id !== editStudentId);
    const emailExists = students.some(s => s.st_Email === studentEmail && s.id !== editStudentId);

    if (codeExists) {
      toast.error("❌ Student code already exists");
      return;
    }
    if (emailExists) {
      toast.error("❌ Email already exists");
      return;
    }

    const dto = {
      ID: isEditMode ? editStudentId : 0,
      st_Code: studentCode,
      st_NameAr: studentNameEn,
      st_NameEn: studentNameEn,
      st_Email: studentEmail,
      st_Image: "",
      phone: studentPhone,
      fac_ID: parseInt(selectedFacultyId),
      Faculty: getFacultyNameById(selectedFacultyId),
      facYearSem_ID: parseInt(selectedSemesterId),
      FacultyYearSemister: getFacultyYearStringById(selectedFacultyYearId),
      Semester: getSemesterNameById(selectedSemesterId)
    };

    try {
      if (!isEditMode) {
        const userDto = {
          displayName: studentNameEn,
          email: studentEmail,
          password: studentPassword,
          phoneNumber: studentPhone,
          userType: "Student"
        };

        const registerRes = await fetch(`${BASE_URL}/api/account/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userDto)
        });

        const registerData = await registerRes.json();

        if (!registerRes.ok) {
          const errorMsg = registerData?.errors?.[0] || "Unknown registration error";
          toast.error(`❌ Register failed: ${errorMsg}`);
          return;
        }
      }

      await fetch(`${BASE_URL}/api/Studets/Add_OR_UpdateStudent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });

      resetForm();
      await fetchData();
      toast.success(`✅ Student ${isEditMode ? "updated" : "added"} successfully`);
    } catch {
      toast.error("❌ Failed to save student");
    }
  };

  const resetForm = () => {
    setStudentCode("");
    setStudentNameEn("");
    setStudentEmail("");
    setStudentPhone("");
    setStudentPassword("");
    setSelectedFacultyId("");
    setSelectedFacultyYearId("");
    setSelectedSemesterId("");
    setIsEditMode(false);
    setEditStudentId(null);
  };

  const deleteStudent = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;
    try {
      await fetch(`${BASE_URL}/api/Studets/DeleteStudent?id=${id}`, { method: 'DELETE' });
      await fetchData();
      toast.success("🗑️ Student deleted");
    } catch {
      toast.error("❌ Failed to delete student");
    }
  };

  const startEdit = (student) => {
    setStudentCode(student.st_Code);
    setStudentNameEn(student.st_NameEn);
    setStudentEmail(student.st_Email);
    setStudentPhone(student.phone);
    setSelectedFacultyId(student.fac_ID);
    const yearId = facultyYears.find(fy => fy.id === semesters.find(s => s.id === student.facYearSem_ID)?.facultyYearId)?.id || "";
    setSelectedFacultyYearId(yearId);
    setSelectedSemesterId(student.facYearSem_ID);
    setIsEditMode(true);
    setEditStudentId(student.id);
    toast.info("✏️ You can now edit the student data");
  };

  const filteredStudents = students.filter(s => {
    const semester = semesters.find(sm => sm.id === s.facYearSem_ID);
    const facultyYear = facultyYears.find(fy => fy.id === semester?.facultyYearId);

    const byFaculty = filterFaculty ? facultyYear?.facultyId === parseInt(filterFaculty) : true;
    const byYear = filterYear ? facultyYear?.id === parseInt(filterYear) : true;

    return byFaculty && byYear;
  });

  const filteredYearsForFilter = filterFaculty
    ? facultyYears.filter(fy => fy.facultyId === parseInt(filterFaculty))
    : facultyYears;

  return (
    <div className="dashboard-card">
      <ToastContainer position="top-center" />
      <div className="card-header"><h3>Student Management</h3></div>

      <div className="form-row" style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <input className="course-input" placeholder="Student Code" value={studentCode} onChange={(e) => setStudentCode(e.target.value)} />
        <input className="course-input" placeholder="Student Name (English)" value={studentNameEn} onChange={(e) => setStudentNameEn(e.target.value)} />
        <input className="course-input" placeholder="Student Email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
        <input className="course-input" placeholder="Phone (Optional)" value={studentPhone} onChange={(e) => setStudentPhone(e.target.value)} />

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <input className="course-input" type={showPassword ? "text" : "password"} placeholder="Password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="icon-btn">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
          <button type="button" onClick={() => setStudentPassword(generatePassword())} className="icon-btn"><FaKey /></button>
        </div>

        <select className="course-input" value={selectedFacultyId} onChange={(e) => setSelectedFacultyId(e.target.value)}>
          <option value="">Select Faculty</option>
          {faculties.map(f => <option key={f.id} value={f.id}>{f.fac_Name}</option>)}
        </select>

        <select className="course-input" value={selectedFacultyYearId} onChange={(e) => setSelectedFacultyYearId(e.target.value)}>
          <option value="">Select Academic Year</option>
          {filteredFacultyYears.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}
        </select>

        <select className="course-input" value={selectedSemesterId} onChange={(e) => setSelectedSemesterId(e.target.value)}>
          <option value="">Select Semester</option>
          {filteredSemesters.map(s => <option key={s.id} value={s.id}>{s.sem_Name}</option>)}
        </select>

        <button className="action-button" onClick={addOrUpdateStudent}>{isEditMode ? "Update" : "Add"} Student</button>
      </div>

      <div className="filter-bar" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <select className="course-input" value={filterFaculty} onChange={(e) => setFilterFaculty(e.target.value)}>
          <option value="">All Faculties</option>
          {faculties.map(f => <option key={f.id} value={f.id}>{f.fac_Name}</option>)}
        </select>
        <select className="course-input" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="">All Academic Years</option>
          {filteredYearsForFilter.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}
        </select>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Code</th>
              <th>Name (En)</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Faculty</th>
              <th>Academic Year</th>
              <th>Semester</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: "center" }}>No students found.</td></tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td>{s.st_Code}</td>
                  <td>{s.st_NameEn}</td>
                  <td>{s.st_Email}</td>
                  <td>{s.phone}</td>
                  <td>{getFacultyNameBySemId(s.facYearSem_ID)}</td>
                  <td>{getFacultyYearStringById(facultyYears.find(fy => fy.id === semesters.find(sm => sm.id === s.facYearSem_ID)?.facultyYearId)?.id)}</td>
                  <td>{getSemesterNameById(s.facYearSem_ID)}</td>
                  <td>
                    <button className="edit-button" onClick={() => startEdit(s)}><FaEdit /></button>
                    <button className="delete-button" onClick={() => deleteStudent(s.id)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentManagement;
