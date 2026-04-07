function RecommendationList({ books }) {
  return (
    <div>
      <h3>Recommended Books</h3>
      {books.map((book, index) => (
        <div key={index}>
          <p>{book.title}</p>
        </div>
      ))}
    </div>
  );
}

export default RecommendationList;
