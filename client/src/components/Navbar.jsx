import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  return (
    <div className="bg-white border-b border-emerald-200 px-8 py-4 flex items-center justify-between">

      <h3 className="text-lg font-semibold text-emerald-900 tracking-wide">
        Smart Library System
      </h3>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">
              Welcome, <span className="font-semibold text-emerald-700">{user.sub}</span>
            </span>
            <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full capitalize">
              {user.role}
            </span>
          </div>
        )}
      </div>

    </div>
  );
}

export default Navbar;
