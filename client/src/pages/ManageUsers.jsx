import { useEffect, useState, useCallback } from "react";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await fetch(`http://127.0.0.1:8000/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchUsers();
  };

  const handleRoleChange = async (id, newRole) => {
    await fetch(`http://127.0.0.1:8000/users/${id}/role?role=${newRole}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-10 py-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Manage Users
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View and manage system users
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">

          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-slate-500">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="py-3">Username</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100"
                    >
                      <td className="py-3 font-medium">
                        {user.username}
                      </td>

                      <td>
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          className="px-3 py-1 border border-slate-300 rounded-lg text-xs"
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:underline text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default ManageUsers;