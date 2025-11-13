async function fetchAuthors() {
    let request = await fetch('/api/authors');
    let authors = await request.json();

    let output = document.querySelector("pre.authors");
    output.textContent = JSON.stringify(authors, null, 2);
}

async function getBooksByAuthor(authorName) {
  const response = await fetch(`/api/books?authorName=${encodeURIComponent(authorName)}`);
  const result = await response.json();
  console.log(result);
}

async function fetchBooks() {
    let request = await fetch('/api/books');
    let books = await request.json();
    let output = document.querySelector("pre.books");
    output.textContent = JSON.stringify(books, null, 2);
}

(async ()=>{

await fetchAuthors();
await fetchBooks();
getBooksByAuthor("Bob McTesterson");

})();