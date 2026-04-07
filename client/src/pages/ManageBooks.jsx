import { useEffect, useState, useCallback } from "react";
import api from "../services/api";

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState(null);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/books");
      setBooks(res.data || []);
      setError(null);
    } catch {
      setError("Failed to load books");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleAddBook = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("quantity", quantity);
    if (image) formData.append("image", image);

    try {
      await api.post("/books", formData);
      setShowModal(false);
      setTitle("");
      setAuthor("");
      setQuantity(1);
      setImage(null);
      fetchBooks();
    } catch {
      setError("Failed to add book");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;

    try {
      await api.delete(`/books/${id}`);
      fetchBooks();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Library Inventory
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage books
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-500 text-white px-5 py-2 rounded-lg hover:bg-emerald-600 transition"
          >
            Add Book
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div className="text-slate-600">Loading books...</div>
        )}

        {error && (
          <div className="text-red-600">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {books.length === 0 && (
              <div className="text-slate-500">
                No books found
              </div>
            )}

            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white border border-slate-200 rounded-xl p-4"
              >
                <div className="h-48 bg-slate-200 rounded-md overflow-hidden mb-3">
                  {book.image_filename ? (
                    <img
                      src={`http://127.0.0.1:8000/uploads/${book.image_filename}`}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                      No Image
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-slate-900 truncate">
                  {book.title}
                </h3>

                <p className="text-xs text-slate-500 truncate">
                  {book.author}
                </p>

                <div className="mt-2 text-xs">
                  {book.available_quantity <= 1 ? (
                    <span className="text-red-600">Low Stock</span>
                  ) : (
                    <span className="text-emerald-600">Available</span>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(book.id)}
                  className="mt-3 text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-[400px] space-y-4">

            <h3 className="text-lg font-semibold text-slate-800">
              Add Book
            </h3>

            <form onSubmit={handleAddBook} className="space-y-3">

              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                required
              />

              <input
                type="text"
                placeholder="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                required
              />

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="text-sm"
              />

              <button
                type="submit"
                className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition"
              >
                Save
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageBooks;