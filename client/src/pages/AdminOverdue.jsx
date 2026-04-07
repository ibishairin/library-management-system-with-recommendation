import { useEffect, useState, useCallback } from "react";

function AdminOverdue() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchOverdue = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/admin/issues", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const today = new Date();

      const overdue = data.filter(
        (issue) =>
          issue.returned_at === null &&
          new Date(issue.due_date) < today
      );

      setIssues(overdue);
    } catch (err) {
      console.error("Failed to fetch overdue issues", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOverdue();
  }, [fetchOverdue]);

  const handleReturn = async (issueId) => {
    await fetch(
      `http://127.0.0.1:8000/admin/return/${issueId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchOverdue();
  };

  const today = new Date();

  return (
    <div className="min-h-screen bg-slate-50 px-10 py-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Overdue Books
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Books that have passed their due date
          </p>
        </div>

        {/* CONTENT */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">

          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : issues.length === 0 ? (
            <p className="text-slate-500">
              No overdue books 🎉
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 text-left">
                    <th className="py-3">Student</th>
                    <th>Book</th>
                    <th>Due Date</th>
                    <th>Days Late</th>
                    <th>Estimated Fine</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {issues.map((issue) => {
                    const due = new Date(issue.due_date);
                    const daysLate = Math.floor(
                      (today - due) / (1000 * 60 * 60 * 24)
                    );

                    const estimatedFine = daysLate * 5;

                    // Handle both nested and flat formats
                    const userName = issue.user?.username || issue.user_name || "Unknown";
                    const bookTitle = issue.book?.title || issue.book_title || "Unknown";

                    return (
                      <tr
                        key={issue.id}
                        className="border-b border-slate-100"
                      >
                        <td className="py-3 font-medium">
                          {userName}
                        </td>

                        <td>{bookTitle}</td>

                        <td className="text-red-600">
                          {due.toLocaleDateString()}
                        </td>

                        <td className="text-red-600 font-medium">
                          {daysLate} days
                        </td>

                        <td className="text-red-600">
                          ₹ {estimatedFine}
                        </td>

                        <td>
                          <button
                            onClick={() => handleReturn(issue.id)}
                            className="text-emerald-600 hover:underline text-xs"
                          >
                            Return
                          </button>
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

export default AdminOverdue;