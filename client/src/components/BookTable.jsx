import { useState } from "react";
import api from "../services/api";

function BookTable({ books, refresh }) {
  const [editingBook, setEditingBook] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;

    try {
      await api.delete(`/books/${id}`);
      refresh();
    } catch (err) {
      alert("Failed to delete book");
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/books/${editingBook.id}`, {
        title: editingBook.title,
        author: editingBook.author,
        quantity: Number(editingBook.total_quantity),
      });

      setEditingBook(null);
      refresh();
    } catch (err) {
      alert("Failed to update book");
    }
  };

  return (
    <>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm bg-white rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-emerald-600 text-white text-left">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Author</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Available</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-emerald-600">
                  No books found
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr
                  key={book.id}
                  className="border-b border-emerald-100 hover:bg-emerald-50 transition"
                >
                  <td className="px-6 py-4 font-medium">{book.title}</td>
                  <td className="px-6 py-4">{book.author}</td>
                  <td className="px-6 py-4">{book.total_quantity}</td>
                  <td className="px-6 py-4">{book.available_quantity}</td>

                  <td className="px-6 py-4">
                    {book.available_quantity <= 1 ? (
                      <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">
                        Available
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center space-x-3">
                    <button
                      onClick={() => setEditingBook(book)}
                      className="px-4 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(book.id)}
                      className="px-4 py-1.5 rounded-lg border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editingBook && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-[420px] space-y-5">

            <h3 className="text-lg font-semibold text-emerald-800">
              Edit Book
            </h3>

            <input
              type="text"
              value={editingBook.title}
              onChange={(e) =>
                setEditingBook({ ...editingBook, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />

            <input
              type="text"
              value={editingBook.author}
              onChange={(e) =>
                setEditingBook({ ...editingBook, author: e.target.value })
              }
              className="w-full px-4 py-2 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />

            <input
              type="number"
              value={editingBook.total_quantity}
              onChange={(e) =>
                setEditingBook({
                  ...editingBook,
                  total_quantity: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={handleUpdate}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Save
              </button>

              <button
                onClick={() => setEditingBook(null)}
                className="px-5 py-2 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default BookTable;
