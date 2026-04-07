import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";   // 🔥 ADD THIS

import AdminDashboard from "./pages/AdminDashboard";
import ManageBooks from "./pages/ManageBooks";
import ManageUsers from "./pages/ManageUsers";
import AdminIssue from "./pages/AdminIssue";
import AdminOverdue from "./pages/AdminOverdue";

import StudentDashboard from "./pages/StudentDashboard";
import StudentBooks from "./pages/StudentBooks";
import MyBooks from "./pages/MyBooks";
import Recommendations from "./pages/Recommendations";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import { jwtDecode } from "jwt-decode";

/* ================= LAYOUT ================= */

function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-slate-50">
        <Navbar />
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

/* ================= APP ================= */

function App() {
  const token = localStorage.getItem("token");

  let role = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
    } catch {
      localStorage.removeItem("token");
    }
  }

  return (
    <Router>
      <Routes>

        {/* ================= LOGIN ================= */}
        <Route
          path="/"
          element={
            token
              ? role === "admin"
                ? <Navigate to="/admin" />
                : <Navigate to="/student" />
              : <Login />
          }
        />

        {/* ================= REGISTER ================= */}
        <Route
          path="/register"
          element={
            token
              ? <Navigate to="/" />
              : <Register />
          }
        />

        {/* ================= ADMIN SECTION ================= */}
        <Route
          element={
            <ProtectedRoute allowedRole="admin">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/books" element={<ManageBooks />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/issues" element={<AdminIssue />} />
          <Route path="/admin/overdue" element={<AdminOverdue />} />
        </Route>

        {/* ================= STUDENT SECTION ================= */}
        <Route
          element={
            <ProtectedRoute allowedRole="student">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/browse-books" element={<StudentBooks />} />
          <Route path="/my-books" element={<MyBooks />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;