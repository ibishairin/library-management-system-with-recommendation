import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="w-64 bg-slate-900 text-slate-200 min-h-screen flex flex-col justify-between px-6 py-8">

      {/* TOP */}
      <div>

        <div className="text-lg font-bold tracking-wide text-white mb-10">
          SMART LIBRARY
        </div>

        {role === "admin" && (
          <div className="space-y-8">

            {/* Overview */}
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">
                Overview
              </p>
              <NavItem to="/admin" label="Dashboard" active={isActive("/admin")} />
            </div>

            {/* Library */}
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">
                Library Management
              </p>
              <div className="flex flex-col gap-2">
                <NavItem to="/admin/books" label="Manage Books" active={isActive("/admin/books")} />
                <NavItem to="/admin/issues" label="Issue / Return" active={isActive("/admin/issues")} />
                <NavItem to="/admin/overdue" label="Overdue Books" active={isActive("/admin/overdue")} />
              </div>
            </div>

            {/* Users */}
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">
                Users
              </p>
              <NavItem to="/admin/users" label="Manage Users" active={isActive("/admin/users")} />
            </div>

          </div>
        )}

        {role === "student" && (
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">
              Student Panel
            </p>

            <div className="flex flex-col gap-2">
              <NavItem to="/student" label="Dashboard" active={isActive("/student")} />
              <NavItem to="/browse-books" label="Browse Books" active={isActive("/browse-books")} />
              <NavItem to="/my-books" label="My Books" active={isActive("/my-books")} />
              <NavItem to="/recommendations" label="Recommendations" active={isActive("/recommendations")} />
            </div>
          </div>
        )}

      </div>

      {/* LOGOUT */}
      {token && (
        <button
          onClick={handleLogout}
          className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl transition font-medium"
        >
          Logout
        </button>
      )}
    </div>
  );
}

function NavItem({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-xl font-medium transition
        ${
          active
            ? "bg-emerald-500 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
    >
      {label}
    </Link>
  );
}

export default Sidebar;