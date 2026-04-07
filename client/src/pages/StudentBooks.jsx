import { useEffect, useState, useCallback } from "react";

function StudentBook() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const fetchBooks = useCallback(async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:8000/books", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setBooks(data);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleIssue = async (bookId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://127.0.0.1:8000/student/issue/${bookId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();

    setMessage(result.message || "Book issued");
    fetchBooks();
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 px-10 py-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Browse Books
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Search and issue available books
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl">
            {message}
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-6 py-4 text-left">Title</th>
                <th className="px-6 py-4 text-left">Author</th>
                <th className="px-6 py-4 text-left">Available</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-6 text-center text-slate-500">
                    No books found
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => {
                  const available = book.available_quantity > 0;

                  return (
                    <tr
                      key={book.id}
                      className="border-t border-slate-200"
                    >
                      <td className="px-6 py-4">{book.title}</td>
                      <td className="px-6 py-4">{book.author}</td>
                      <td className="px-6 py-4">
                        {book.available_quantity}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
                            available
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {available ? "Available" : "Out of Stock"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          disabled={!available}
                          onClick={() => handleIssue(book.id)}
                          className={`px-4 py-1.5 rounded-lg text-sm transition ${
                            available
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : "bg-slate-300 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          Issue
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default StudentBook;