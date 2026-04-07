import { useEffect, useState, useCallback } from "react";

function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/student/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch dashboard");

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Dashboard error:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRenew = async (issueId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/student/renew/${issueId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await res.json();

      if (!res.ok) {
        alert(result.detail);
        return;
      }

      fetchDashboard();
    } catch (err) {
      console.error("Renew error:", err);
    }
  };

  const handlePayFine = async (issueId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/student/pay-fine/${issueId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await res.json();

      if (!res.ok) {
        alert(result.detail);
        return;
      }

      fetchDashboard();
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        No data available
      </div>
    );
  }

  const activeBooks = data.active_books || [];
  const history = data.borrow_history || [];
  const stats = data.stats || {};

  return (
    <div className="min-h-screen bg-slate-50 px-10 py-10">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Student Dashboard
          </h1>
        </div>

        {/* OVERDUE ALERT */}
        {stats.overdue_books > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            You have {stats.overdue_books} overdue book(s).
            <span className="font-semibold ml-2">
              Pending Fine: ₹ {stats.pending_fine}
            </span>
          </div>
        )}

        {/* STATS */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Active Books" value={stats.active_books} />
          <StatCard title="Total Borrowed" value={stats.total_borrowed} />
          <StatCard title="Overdue Books" value={stats.overdue_books} />
          <StatCard title="Pending Fine" value={`₹ ${stats.pending_fine}`} />
        </section>

        {/* ACTIVE BOOKS */}
        <Section title="Currently Issued Books">
          {activeBooks.length === 0 ? (
            <Empty text="No active books" />
          ) : (
            activeBooks.map((book) => (
              <div
                key={book.issue_id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
              >
                <h4 className="font-semibold text-slate-800">
                  {book.title}
                </h4>

                <p className="text-sm text-slate-500 mt-2">
                  Due Date:
                  <span className="ml-2 font-medium text-slate-700">
                    {new Date(book.due_date).toLocaleDateString()}
                  </span>
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Renewals used: {book.renew_count} / 2
                </p>

                {book.is_overdue && (
                  <div className="mt-2 text-sm text-red-600">
                    Overdue • Fine: ₹ {book.current_fine}
                  </div>
                )}

                {book.current_fine > 0 && !book.fine_paid && (
                  <button
                    onClick={() => handlePayFine(book.issue_id)}
                    className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Pay Fine ₹ {book.current_fine}
                  </button>
                )}

                {book.fine_paid && (
                  <div className="mt-2 text-sm text-emerald-600">
                    Fine Paid
                  </div>
                )}

                <button
                  onClick={() => handleRenew(book.issue_id)}
                  disabled={!book.can_renew}
                  className={`mt-4 px-4 py-2 rounded-lg text-sm transition ${
                    book.can_renew
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {book.can_renew ? "Renew" : "Cannot Renew"}
                </button>
              </div>
            ))
          )}
        </Section>

        {/* BORROW HISTORY */}
        <Section title="Borrow History">
          {history.length === 0 ? (
            <Empty text="No history yet" />
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left">Book</th>
                    <th className="px-6 py-4 text-left">Returned On</th>
                    <th className="px-6 py-4 text-left">Fine</th>
                    <th className="px-6 py-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr key={index} className="border-t border-slate-200">
                      <td className="px-6 py-4">{item.title}</td>
                      <td className="px-6 py-4">
                        {new Date(item.returned_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        ₹ {item.fine}
                      </td>
                      <td className="px-6 py-4">
                        {item.fine_paid ? (
                          <span className="text-emerald-600 text-xs">
                            Paid
                          </span>
                        ) : (
                          <span className="text-red-600 text-xs">
                            Unpaid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <p className="text-sm text-slate-500 mb-2">{title}</p>
      <p className="text-2xl font-bold text-slate-900">
        {value ?? 0}
      </p>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-slate-500 text-sm">
      {text}
    </div>
  );
}

export default StudentDashboard;