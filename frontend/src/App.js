import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import EmailVerification from "./pages/EmailVerification";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeList from "./pages/EmployeeList";
import EmployeeDetail from "./pages/EmployeeDetail";
import CreateEmployee from "./pages/CreateEmployee";
import EditEmployee from "./pages/EditEmployee";
import DepartmentMaster from "./pages/DepartmentMaster";
import SkillsMaster from "./pages/SkillsMaster";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>🚀 Full-Stack Auth App</h1>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email/:token" element={<EmailVerification />} />
          
          {/* 🔒 Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Employee Management Routes */}
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employee/:id" element={<EmployeeDetail />} />
            <Route path="/create-employee" element={<CreateEmployee />} />
            <Route path="/edit-employee/:id" element={<EditEmployee />} />
            
            {/* Master Data Routes */}
            <Route path="/departments" element={<DepartmentMaster />} />
            <Route path="/skills" element={<SkillsMaster />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;