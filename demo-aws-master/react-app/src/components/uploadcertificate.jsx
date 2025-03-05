import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./upload.css";

const UploadCertificate = () => {
  const [name, setName] = useState("");
  const [certificateType, setCertificateType] = useState("");
  const [document_name, setDocument_name] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleCertificateTypeChange = (event) => {
    setCertificateType(event.target.value);
  };

  const handleDocumentNameChange = (event) => {
    setDocument_name(event.target.value);
  };

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name || !certificateType || !pdfFile || !document_name) {
      setError("All fields are required.");
      setSuccessMessage("");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("certificate_type", certificateType);
    formData.append("pdf_file", pdfFile);
    formData.append("document_name", document_name);

    try {
      const response = await axios.post(
        "http://localhost:8000/upload-certificate/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setSuccessMessage(response.data.message);
        setError("");
      }
    } catch (err) {
      setError(
        err.response ? err.response.data.error : "Something went wrong."
      );
      setSuccessMessage("");
    }
  };

  return (
    <div className="upload-form">
      <h2>Upload Certificate</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Username:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            required
          />
        </div>

        <div>
          <label htmlFor="certificate_type">Certificate Type:</label>
          <select
            id="certificate_type"
            value={certificateType}
            onChange={handleCertificateTypeChange}
            required
          >
            <option value="professional">Professional</option>
            <option value="personal">Personal</option>
            <option value="education">Education</option>
          </select>
        </div>

        <div>
          <label htmlFor="document_name">Document Name:</label>
          <input
            type="text"
            id="document_name"
            value={document_name}
            onChange={handleDocumentNameChange}
            required
          />
        </div>

        <div>
          <label htmlFor="pdf_file">Upload PDF:</label>
          <input
            type="file"
            id="pdf_file"
            accept="application/pdf"
            onChange={handleFileChange}
            required
          />
        </div>

        <div>
          <button type="submit">Upload Certificate</button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {/* Logout button */}
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
};

export default UploadCertificate;
