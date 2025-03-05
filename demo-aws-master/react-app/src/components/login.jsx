import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FileList from "./FileList"; // Import FileList
import "./login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username || !password) {
      setError("Username and Password are required.");
      setSuccessMessage("");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/login/", {
        username,
        password,
      });

      console.log("API Response:", response.data); 

      if (response.status === 200) {
        setSuccessMessage(response.data.message || "Login successful!");
        setError("");

        // Store user details
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("username", username);
        setIsLoggedIn(true); 

        // Redirect after successful login (optional)
        setTimeout(() => navigate("/upload"), 1000);
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Invalid credentials.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="login-form">
      {!isLoggedIn ? (
        <>
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <button type="submit">Login</button>
            </div>
          </form>
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
        </>
      ) : (
        <FileList username={username} certificateType="Professional" document_name="resume.pdf" />
      )}
    </div>
  );
};

export default Login;
