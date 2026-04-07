import { useEffect, useState, useCallback } from "react";

function Recommendations() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/recommend-user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setBooks(data);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setBooks([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Loading recommendations...
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        No recommendations yet. Borrow more books.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-10 py-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Recommended For You
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Books based on your borrowing activity
          </p>
        </div>

        {/* GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold text-slate-800">
                {book.title}
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Author: {book.author}
              </p>

              <div className="mt-4 text-xs text-slate-400">
                Popularity Score: {book.score}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Recommendations;