import { useState } from "react";

function BookForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("quantity", quantity);

    if (image) {
      formData.append("image", image);
    }

    onSubmit(formData);

    setTitle("");
    setAuthor("");
    setQuantity(1);
    setImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        type="text"
        placeholder="Book Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-2 border border-emerald-300 rounded-xl"
      />

      <input
        type="text"
        placeholder="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="w-full px-4 py-2 border border-emerald-300 rounded-xl"
      />

      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-full px-4 py-2 border border-emerald-300 rounded-xl"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="w-full"
      />

      <button
        type="submit"
        className="w-full bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 transition"
      >
        Add Book
      </button>

    </form>
  );
}

export default BookForm;
