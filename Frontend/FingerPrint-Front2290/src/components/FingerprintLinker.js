// src/components/FingerprintLinker.jsx

import React, { useState, useCallback } from 'react';
import config from '../config';

function FingerprintLinker() {
  const [email, setEmail] = useState("");
  const [fingerprintId, setFingerprintId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const BASE_URL = config.BASE_URL;

  const getSensorDataById = useCallback(async (idToFetch) => {
    try {
      const response = await fetch(`${BASE_URL}/api/sensordata/${idToFetch}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Network error while fetching fingerprint data: ${response.status} ${response.statusText}`);
    } catch (err) {
      console.error(`Error fetching sensor data for ID ${idToFetch}:`, err);
      throw err;
    }
  }, [BASE_URL]);

  const checkStudentByEmail = useCallback(async (emailToCheck) => {
    try {
      const response = await fetch(`${BASE_URL}/api/Studets/GetStudetByEmail?Email=${emailToCheck}`);
      if (response.ok) {
        const studentData = await response.json();
        return studentData;
      }
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      throw new Error(`Failed to check student: ${response.status} ${response.statusText} - ${errorText}`);
    } catch (error) {
      console.error(`Error checking student by email ${emailToCheck}:`, error);
      throw error;
    }
  }, [BASE_URL]);

  const actualLinkFingerprint = useCallback(async (emailToLink, fingerprintIdToLink) => {
    const student = await checkStudentByEmail(emailToLink);
    if (!student) {
      throw new Error(`Student with email ${emailToLink} not found.`);
    }

    let sensorData = null;
    try {
      sensorData = await getSensorDataById(fingerprintIdToLink);
    } catch (error) {
      throw new Error(`Failed to contact fingerprint sensor service: ${error.message}`);
    }

    if (sensorData === null) {
      throw new Error(`Fingerprint ID ${fingerprintIdToLink} not found or has no previous fingerprint data.`);
    }

    const studentToUpdate = {
      ID: student.id,
      St_Code: student.st_Code,
      St_NameAr: student.st_NameAr,
      St_NameEn: student.st_NameEn || null,
      St_Email: student.st_Email,
      St_Image: student.st_Image || null,
      Phone: student.phone,
      FingerID: fingerprintIdToLink,
      FacYearSem_ID: student.facYearSem_ID,
      FacultyYearSemister: student.facultyYearSemister || "",
    };

    const response = await fetch(`${BASE_URL}/api/Studets/Add_OR_UpdateStudent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentToUpdate),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData.message ||
        (errorData.errors && errorData.errors.join(", ")) ||
        'Failed to link fingerprint or update student data.';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  }, [BASE_URL, checkStudentByEmail, getSensorDataById]);

  const handleLink = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await actualLinkFingerprint(email, fingerprintId);
      setSuccess(`Fingerprint ID ${fingerprintId} successfully linked to student ${email}.`);
      setEmail("");
      setFingerprintId("");
    } catch (err) {
      console.error("Failed to link fingerprint:", err);
      setError(err.message || "An unexpected error occurred while linking.");
    } finally {
      setLoading(false);
    }
  };

  // Minimal styling to keep it horizontal, neat, and like your original dashboard
  const rowStyle = {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 18,
    flexWrap: "wrap"
  };
  const inputStyle = {
    minWidth: 180,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1.5px solid #e0e4f1",
    fontSize: 15,
    background: "#fafbfc"
  };
  const btnStyle = {
    padding: "10px 20px",
    fontSize: 15,
    background: "#217bf3",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.18s"
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 10 }}>Link Fingerprint to Student</h3>
      </div>
      <div className="form-row" style={rowStyle}>
        <input
          style={inputStyle}
          placeholder="Student Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          style={inputStyle}
          placeholder="Fingerprint Device ID"
          value={fingerprintId}
          onChange={(e) => setFingerprintId(e.target.value)}
          disabled={loading}
        />
        <button
          style={btnStyle}
          onClick={handleLink}
          disabled={!email || !fingerprintId || loading}
        >
          {loading ? 'Linking...' : 'Link Fingerprint'}
        </button>
      </div>
      {error && <div style={{ color: '#e74c3c', marginTop: 8, fontWeight: 500 }}>{error}</div>}
      {success && <div style={{ color: '#15803d', marginTop: 8, fontWeight: 500 }}>{success}</div>}
    </div>
  );
}

export default FingerprintLinker;
