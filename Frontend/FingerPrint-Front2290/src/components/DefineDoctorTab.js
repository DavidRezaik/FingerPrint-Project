import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaTrash, FaEdit, FaKey } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './StudentManagement.css';
import config from "../config";

function DefineDoctorTab() {
  const [doctors, setDoctors] = useState([]);
  const [doctorCode, setDoctorCode] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");
  const [doctorPassword, setDoctorPassword] = useState("");
  const [doctorDepartment, setDoctorDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDoctorId, setEditDoctorId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  const BASE_URL = config.BASE_URL;

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/Doctors/GetAllDoctors`);
      const data = await res.json();
      setDoctors(data);
    } catch {
      toast.error("❌ Failed to load doctors");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/Faculty/GetAllFaculty`);
      const data = await res.json();
      setDepartments(data);
    } catch {
      toast.error("❌ Failed to load departments");
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchDepartments();
  }, []);

  const generatePassword = () => {
    return `${doctorCode}${doctorName.split(" ")[0]}@123`;
  };

  const handleSubmit = async () => {
    if (!doctorCode || !doctorName || !doctorEmail || !doctorPhone || !doctorPassword || !doctorDepartment) {
      toast.warning("Please fill in all required fields");
      return;
    }

    const dto = {
      ID: isEditMode ? editDoctorId : 0,
      Dr_Code: doctorCode,
      Dr_NameAr: doctorName,
      Dr_NameEn: doctorName,
      Dr_Email: doctorEmail,
      Phone: doctorPhone,
      Dr_Image: "",
      Faculty: departments.find(d => d.id === parseInt(doctorDepartment))?.fac_Name || "",
      Fac_ID: parseInt(doctorDepartment)
    };

    try {
      await fetch(`${BASE_URL}/api/Doctors/Add_OR_UpdateDoctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });

      if (!isEditMode) {
        const userDto = {
          displayName: doctorName,
          email: doctorEmail,
          password: doctorPassword,
          phoneNumber: doctorPhone,
          userType: "Doctor"
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

      resetForm();
      await fetchDoctors();
      toast.success(`✅ Doctor ${isEditMode ? "updated" : "added"} successfully`);
    } catch {
      toast.error("❌ Failed to save doctor");
    }
  };

  const resetForm = () => {
    setDoctorCode("");
    setDoctorName("");
    setDoctorEmail("");
    setDoctorPhone("");
    setDoctorPassword("");
    setDoctorDepartment("");
    setIsEditMode(false);
    setEditDoctorId(null);
  };

  const startEdit = (doctor) => {
    setDoctorCode(doctor.dr_Code);
    setDoctorName(doctor.dr_NameAr);
    setDoctorEmail(doctor.dr_Email);
    setDoctorPhone(doctor.phone);
    setDoctorDepartment(doctor.fac_ID); // ✅ استخدام الحقل الصحيح
    setIsEditMode(true);
    setEditDoctorId(doctor.id);
    toast.info("✏️ You can now edit the doctor data");
  };

  const deleteDoctor = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this doctor?");
    if (!confirmDelete) return;
    try {
      await fetch(`${BASE_URL}/api/Doctors/DeleteDoctor?id=${id}`, { method: 'DELETE' });
      await fetchDoctors();
      toast.success("🗑️ Doctor deleted");
    } catch {
      toast.error("❌ Failed to delete doctor");
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.dr_NameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.dr_Email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.dr_Code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment ? doc.fac_ID === parseInt(filterDepartment) : true;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="dashboard-card">
      <ToastContainer position="top-center" />
      <div className="card-header"><h3>Define Doctor</h3></div>

      <div className="form-row" style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <input className="course-input" placeholder="Doctor Code" value={doctorCode} onChange={(e) => setDoctorCode(e.target.value)} />
        <input className="course-input" placeholder="Full Name" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
        <input className="course-input" placeholder="Email" value={doctorEmail} onChange={(e) => setDoctorEmail(e.target.value)} />
        <input className="course-input" placeholder="Phone" value={doctorPhone} onChange={(e) => setDoctorPhone(e.target.value)} />

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <input className="course-input" type={showPassword ? "text" : "password"} placeholder="Password" value={doctorPassword} onChange={(e) => setDoctorPassword(e.target.value)} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="icon-btn">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
          <button type="button" onClick={() => setDoctorPassword(generatePassword())} className="icon-btn"><FaKey /></button>
        </div>

        <select className="course-input" value={doctorDepartment} onChange={(e) => setDoctorDepartment(e.target.value)}>
          <option value="">Select Department</option>
          {departments.map(f => <option key={f.id} value={f.id}>{f.fac_Name}</option>)}
        </select>

        <button className="action-button" onClick={handleSubmit}>{isEditMode ? "Update" : "Add"} Doctor</button>
      </div>

      <div className="filter-bar" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input className="course-input" placeholder="Search by name, email, or code" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <select className="course-input" value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(f => <option key={f.id} value={f.id}>{f.fac_Name}</option>)}
        </select>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.dr_Code}</td>
                <td>{doc.dr_NameAr}</td>
                <td>{doc.dr_Email}</td>
                <td>{doc.phone}</td>
                <td>{doc.faculty}</td>
                <td>
                  <button className="edit-button" onClick={() => startEdit(doc)}><FaEdit /></button>
                  <button className="delete-button" onClick={() => deleteDoctor(doc.id)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DefineDoctorTab;
