import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  // 🪙 Check if the user has a token saved
  const token = localStorage.getItem("token");

  // If a token exists, render the child routes via <Outlet />. Otherwise, redirect to Login.
  return token ? <Outlet /> : <Navigate to="/" replace />;
}

export default ProtectedRoute;