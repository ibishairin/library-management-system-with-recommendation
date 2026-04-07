function BookGrid({ books, refresh }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

      {books.length === 0 && (
        <div className="text-emerald-600">
          No books found
        </div>
      )}

      {books.map((book) => (
        <div
          key={book.id}
          className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
        >

          {/* Cover */}
          <div className="h-40 mb-4 flex justify-center items-center bg-emerald-50 rounded-xl">
            {book.image_filename ? (
              <img
                src={`http://127.0.0.1:8000/uploads/${book.image_filename}`}
                alt={book.title}
                className="h-full object-cover rounded-md"
              />
            ) : (
              <span className="text-emerald-500 text-sm">
                No Image
              </span>
            )}
          </div>

          {/* Info */}
          <h3 className="font-semibold text-emerald-900 mb-1">
            {book.title}
          </h3>

          <p className="text-sm text-emerald-700 mb-3">
            {book.author}
          </p>

          <div className="flex justify-between text-sm mb-3">
            <span>Total: {book.total_quantity}</span>
            <span>Available: {book.available_quantity}</span>
          </div>

          {/* Status */}
          {book.available_quantity <= 1 ? (
            <div className="mb-3 px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 w-fit">
              Low Stock
            </div>
          ) : (
            <div className="mb-3 px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 w-fit">
              Available
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 border border-emerald-600 text-emerald-700 py-1.5 rounded-lg hover:bg-emerald-600 hover:text-white transition">
              Edit
            </button>

            <button className="flex-1 border border-red-600 text-red-600 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition">
              Delete
            </button>
          </div>

        </div>
      ))}
    </div>
  );
}

export default BookGrid;
