import { useState } from "react";

function SearchBooks() {
  const [query, setQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://127.0.0.1:8000/books/search?query=${query}&available_only=${availableOnly}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setResults(data);
  };

  return (
    <div>
      <h3>Search Books</h3>

      <input
        type="text"
        placeholder="Search by title or author"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <label style={{ marginLeft: "10px" }}>
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={() => setAvailableOnly(!availableOnly)}
        />
        Available Only
      </label>

      <button onClick={handleSearch} style={{ marginLeft: "10px" }}>
        Search
      </button>

      <ul>
        {results.map((book) => (
          <li key={book.id}>
            {book.title} — {book.author}  
            (Available: {book.available_quantity})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchBooks;
