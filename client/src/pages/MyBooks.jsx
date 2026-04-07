import { useEffect, useState, useCallback } from "react";

function MyBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchMyBooks = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/student/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setBooks(data.active_books || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyBooks();
  }, [fetchMyBooks]);

  const handleRenew = async (issueId) => {
    await fetch(
      `http://127.0.0.1:8000/student/renew/${issueId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchMyBooks();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-10 py-10">
      <div className="max-w-5xl mx-auto space-y-10">

        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            My Borrowed Books
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            View and manage your currently issued books
          </p>
        </div>

        {books.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-slate-500">
            You have no active books.
          </div>
        ) : (
          <div className="space-y-6">
            {books.map((book) => (
              <div
                key={book.issue_id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {book.title}
                  </h3>

                  <p className="text-sm text-slate-500 mt-2">
                    Due Date:{" "}
                    <span className="font-medium text-slate-700">
                      {new Date(book.due_date).toLocaleDateString()}
                    </span>
                  </p>

                  {book.is_overdue && (
                    <p className="text-sm text-red-600 mt-1">
                      Overdue • Fine: ₹ {book.current_fine}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => handleRenew(book.issue_id)}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm transition"
                  >
                    Renew
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyBooks;