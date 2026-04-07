import { useEffect, useState, useCallback } from "react";

function AdminIssue() {
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBook, setSelectedBook] = useState("");

  const [searchStudent, setSearchStudent] = useState("");
  const [searchBook, setSearchBook] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [usersRes, booksRes, issuesRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://127.0.0.1:8000/books", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://127.0.0.1:8000/admin/issues", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!usersRes.ok || !booksRes.ok || !issuesRes.ok)
        throw new Error("Failed to fetch data");

      const users = await usersRes.json();
      const booksData = await booksRes.json();
      const issuesData = await issuesRes.json();

      setStudents(users.filter((u) => u.role === "student"));
      setBooks(booksData);
      setIssues(issuesData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleIssue = async () => {
    if (!selectedStudent || !selectedBook) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/admin/issue?student_id=${selectedStudent}&book_id=${selectedBook}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await res.json();

      if (!res.ok) {
        alert(result.detail || "Issue failed");
        return;
      }

      setSelectedStudent("");
      setSelectedBook("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturn = async (issueId) => {
    try {
      await fetch(
        `http://127.0.0.1:8000/admin/return/${issueId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const today = new Date();

  const filteredIssues = issues.filter((issue) => {
    const isReturned = issue.returned_at !== null;
    const isOverdue =
      issue.returned_at === null &&
      new Date(issue.due_date) < today;

    if (statusFilter === "active" && isReturned) return false;
    if (statusFilter === "returned" && !isReturned) return false;
    if (statusFilter === "overdue" && !isOverdue) return false;

    // Handle both nested (user.username) and flat (user_name) formats
    const userName = issue.user?.username || issue.user_name || "Unknown";
    const bookTitle = issue.book?.title || issue.book_title || "Unknown";

    if (
      searchStudent &&
      !userName.toLowerCase().includes(searchStudent.toLowerCase())
    )
      return false;

    if (
      searchBook &&
      !bookTitle.toLowerCase().includes(searchBook.toLowerCase())
    )
      return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 px-10 py-10">
      <div className="max-w-7xl mx-auto space-y-8">

        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Issue & Return Management
          </h1>
        </div>

        {/* ISSUE BAR */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 items-center">

          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.username}
              </option>
            ))}
          </select>

          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="">Select Book</option>
            {books
              .filter((b) => b.available_quantity > 0)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.available_quantity})
                </option>
              ))}
          </select>

          <button
            onClick={handleIssue}
            disabled={!selectedStudent || !selectedBook}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition disabled:opacity-40"
          >
            Issue
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <input
              placeholder="Search student..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            />

            <input
              placeholder="Search book..."
              value={searchBook}
              onChange={(e) => setSearchBook(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : filteredIssues.length === 0 ? (
            <p className="text-slate-500">No records found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 text-left">
                    <th className="py-3">Student</th>
                    <th>Book</th>
                    <th>Due Date</th>
                    <th>Renew</th>
                    <th>Fine</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) => {
                    const due = new Date(issue.due_date);
                    const isOverdue =
                      issue.returned_at === null && due < today;
                    const isReturned = issue.returned_at !== null;
                    
                    // Handle both nested and flat formats
                    const userName = issue.user?.username || issue.user_name || "Unknown";
                    const bookTitle = issue.book?.title || issue.book_title || "Unknown";

                    return (
                      <tr key={issue.id} className="border-b border-slate-100">
                        <td className="py-3 font-medium">
                          {userName}
                        </td>
                        <td>{bookTitle}</td>
                        <td>{due.toLocaleDateString()}</td>
                        <td>
                          {issue.renew_count ?? 0} / 2
                        </td>
                        <td>
                          ₹ {issue.fine ?? 0}
                        </td>
                        <td>
                          {isReturned ? (
                            <span className="text-emerald-600 text-xs">
                              Returned
                            </span>
                          ) : isOverdue ? (
                            <span className="text-red-600 text-xs">
                              Overdue
                            </span>
                          ) : (
                            <span className="text-yellow-600 text-xs">
                              Active
                            </span>
                          )}
                        </td>
                        <td>
                          {!isReturned && (
                            <button
                              onClick={() => handleReturn(issue.id)}
                              className="text-emerald-600 hover:underline text-xs"
                            >
                              Return
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminIssue;