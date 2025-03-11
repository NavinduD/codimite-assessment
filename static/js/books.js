// Handles the submission of new book form
function submitBookForm(event) {
    event.preventDefault();
    const formData = {
        title: document.getElementById('title').value,
        genre: document.getElementById('genre').value,
        author_id: document.getElementById('author_id').value
    };

    fetch("/books", { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json().then(data => ({status: response.status, body: data})))
    .then(({status, body}) => {
        if (status === 400) {
            showToast(body.errors.join('\n'), 'error');
            return;
        }
        if (status === 404) {
            showToast('Error: ' + body.error, 'error');
            return;
        }
        if (status === 500) {
            showToast('Server error: ' + body.error, 'error');
            return;
        }
        
        document.getElementById('bookPopup').style.display = 'none';
        document.getElementById('bookForm').reset();
        
        // Get current page and per page values
        const currentPage = parseInt(document.getElementById('pageInfo').textContent.split(' ')[1]);
        const perPage = document.getElementById('perPage').value;
        loadBooks(currentPage, perPage);
        
        showToast('Book added successfully!');
    })
    .catch(error => {
        showToast('Error: ' + error, 'error');
    });
}

// Populates the edit form with book data for editing
function editBook(id) {
    fetch(`/books/${id}`)
        .then(response => response.json())
        .then(book => {
            document.getElementById('edit_book_id').value = book.id;
            document.getElementById('edit_title').value = book.title;
            document.getElementById('edit_genre').value = book.genre;
            document.getElementById('edit_author_id').value = book.author_id;
            document.getElementById('editBookPopup').style.display = 'block';
        });
}

// Handles the submission of edited book data
function submitEditBookForm(event) {
    event.preventDefault();
    const id = document.getElementById('edit_book_id').value;
    const formData = {
        title: document.getElementById('edit_title').value,
        genre: document.getElementById('edit_genre').value,
        author_id: document.getElementById('edit_author_id').value
    };

    fetch(`/books/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json().then(data => ({status: response.status, body: data})))
    .then(({status, body}) => {
        if (status === 400) {
            showToast(body.errors.join('\n'), 'error');
            return;
        }
        if (status === 404 || status === 500) {
            showToast(body.error, 'error');
            return;
        }
        const row = document.querySelector(`tr[data-id="${id}"]`);
        row.innerHTML = `
            <td>${body.id}</td>
            <td>${body.title}</td>
            <td>${body.genre}</td>
            <td>${body.author_name}</td>
            <td>
                <button class="edit-btn" onclick="editBook(${body.id})">Edit</button>
                <button class="delete-btn" onclick="deleteBook(${body.id})">Delete</button>
            </td>
        `;
        document.getElementById('editBookPopup').style.display = 'none';
        showToast('Book updated successfully!');
    });
}

// Handles book deletion with confirmation dialog
function deleteBook(id) {
    showConfirmDialog('Are you sure you want to delete this book?', () => {
        fetch(`/books/${id}`, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json().then(data => ({status: response.status, body: data})))
        .then(({status, body}) => {
            if (status === 404 || status === 500) {
                showToast(body.error, 'error');
                return;
            }
            
            // Get current page and per page values
            const currentPage = parseInt(document.getElementById('pageInfo').textContent.split(' ')[1]);
            const perPage = document.getElementById('perPage').value;
            
            // Reload the books list
            loadBooks(currentPage, perPage);
            showToast('Book deleted successfully!');
        });
    });
}

// Fetches and displays books with pagination and filtering
function loadBooks(page = 1, perPage = 10) {
    const genre = document.getElementById('genreFilter').value;
    const authorId = document.getElementById('authorFilter').value;
    
    let url = `/books?page=${page}&per_page=${perPage}`;
    if (genre) url += `&genre=${encodeURIComponent(genre)}`;
    if (authorId) url += `&author_id=${authorId}`;

    // Fetch and render books
    fetch(url, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        const tbody = document.querySelector('tbody');
        tbody.innerHTML = '';

        // Show "No books" message if no data
        if (data.books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No books available</td></tr>';
            return;
        }

        // Render each book row
        data.books.forEach(book => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', book.id);
            tr.innerHTML = `
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.genre}</td>
                <td>${book.author_name}</td>
                <td>
                    <button class="edit-btn" onclick="editBook(${book.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteBook(${book.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Update pagination UI
        const currentPage = data.pagination.page;
        const totalPages = data.pagination.total_pages;
        
        document.getElementById('prevButton').disabled = currentPage <= 1;
        document.getElementById('nextButton').disabled = currentPage >= totalPages;
        document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById('totalItems').textContent = `Total Items: ${data.pagination.total_items}`;
    })
    .catch(error => {
        showToast('Error loading books: ' + error, 'error');
    });
}

// Handles page navigation
function changePage(page) {
    const perPage = document.getElementById('perPage').value;
    loadBooks(page, perPage);
}

// Updates the number of items shown per page
function changePerPage(perPage) {
    loadBooks(1, perPage);
}

// Applies genre and author filters
function applyFilters() {
    loadBooks(1, document.getElementById('perPage').value);
}

// Initialize the books list when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
});
