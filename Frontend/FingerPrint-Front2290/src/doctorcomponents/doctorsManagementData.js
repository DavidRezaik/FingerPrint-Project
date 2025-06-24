// Doctors Management tab data and logic
export const doctorsManagementData = {
  // Initial form data structure
  getInitialFormData: () => ({
    name: "",
    email: "",
    id: "",
    title: "",
    department: "",
    phone: "",
    office: "",
    officeHours: "",
    experience: 0,
    researchAreas: "",
  }),

  // Form fields configuration
  getFormFields: () => [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "id", label: "ID", type: "text", required: true },
    { key: "title", label: "Title", type: "text" },
    { key: "department", label: "Department", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "office", label: "Office", type: "text" },
    { key: "officeHours", label: "Office Hours", type: "text" },
    { key: "experience", label: "Experience (years)", type: "number" },
    { key: "researchAreas", label: "Research Areas (comma-separated)", type: "text" },
  ],

  // Table columns for doctors
  getTableColumns: () => ["ID", "Name", "Email", "Department", "Title", "Actions"],

  // Prepare doctor data for submission
  prepareDoctorData: (formData) => ({
    ...formData,
    experience: Number.parseInt(formData.experience) || 0,
    researchAreas: formData.researchAreas
      .split(",")
      .map((area) => area.trim())
      .filter((area) => area !== ""),
  }),

  // Populate form data from doctor object
  populateFormData: (doctor) => ({
    name: doctor.name || "",
    email: doctor.email || "",
    id: doctor.id || "",
    title: doctor.title || "",
    department: doctor.department || "",
    phone: doctor.phone || "",
    office: doctor.office || "",
    officeHours: doctor.officeHours || "",
    experience: doctor.experience || 0,
    researchAreas: doctor.researchAreas?.join(", ") || "",
  }),
}
