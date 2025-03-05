import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import UploadCertificate from "./components/uploadcertificate";
import FileList from "./components/FileList";


const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<UploadCertificate />} />
          <Route path="/download" element={<FileList />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
};

// const Dashboard = () => {
//   const username = "JohnDoe"; // Replace with dynamic username
//   const certificateType = "Professional"; // Replace dynamically

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-4">Employee Documents</h1>
//       <FileList username={username} certificateType={certificateType} />
//     </div>
//   );
// };


export default App;



