"use client"

import { useState } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { ThemeProvider } from "styled-components"
import * as Components from "./Components"
import StudentDashboard from "./StudentDashboard"
import DoctorDashboard from "./DoctorDashboard"
import AdminDashboard from "./components/AdminDashboard"
import { LanguageProvider } from "./contexts/LanguageContext"
import LoginForm from "./LoginForm"
import "./styles.css"

function App() {
  const theme = {
    background: "#f6f5f7",
    text: "#333",
    container: "#fff",
    form: "#ffffff",
    title: "#1b2a49",
    inputBackground: "#f8f9fa",
    inputFocusBackground: "#fff",
    inputFocusBorder: "#3498db",
    button: "#1b2a49",
    buttonHover: "#2c3e50",
    buttonActive: "#0f1a29",
    buttonText: "#fff",
    link: "#3498db",
    linkHover: "#2980b9",
    ghostButton: "#fff",
    ghostButtonHover: "rgba(255, 255, 255, 0.2)",
    error: "#e74c3c",
  }

  return (
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  )
}

export default App