import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LeaveProvider } from './context/LeaveContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import EmailVerification from './pages/EmailVerification';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeDetail from './pages/EmployeeDetail';
import CreateEmployee from './pages/CreateEmployee';
import EditEmployee from './pages/EditEmployee';
import DepartmentMaster from './pages/DepartmentMaster';
import SkillsMaster from './pages/SkillsMaster';
import ApplyLeave from './pages/leave/ApplyLeave';
import MyLeaves from './pages/leave/MyLeaves';
import LeaveApprovals from './pages/leave/LeaveApprovals';
import LeaveBalance from './pages/leave/LeaveBalance';
import LeaveReports from './pages/leave/LeaveReports';

function App() {
  return (
    <AuthProvider>
      <LeaveProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email/:token" element={<EmailVerification />} />
            
            {/* Protected - All authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employee/:id" element={<EmployeeDetail />} />
              <Route path="/create-employee" element={<CreateEmployee />} />
              <Route path="/edit-employee/:id" element={<EditEmployee />} />
              <Route path="/departments" element={<DepartmentMaster />} />
              <Route path="/skills" element={<SkillsMaster />} />
              <Route path="/leave/my-leaves" element={<MyLeaves />} />
              <Route path="/leave/balance" element={<LeaveBalance />} />
            </Route>

            {/* Protected - Employee & Manager can apply */}
            <Route element={<ProtectedRoute allowedRoles={['user', 'manager']} />}>
              <Route path="/leave/apply" element={<ApplyLeave />} />
            </Route>

            {/* Protected - Manager & HR can approve */}
            <Route element={<ProtectedRoute allowedRoles={['manager', 'hr']} />}>
              <Route path="/leave/pending" element={<LeaveApprovals />} />
            </Route>

            {/* Protected - HR & Admin reports */}
            <Route element={<ProtectedRoute allowedRoles={['hr', 'admin']} />}>
              <Route path="/leave/reports" element={<LeaveReports />} />
            </Route>

            {/* Protected - Admin only */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LeaveProvider>
    </AuthProvider>
  );
}

export default App;