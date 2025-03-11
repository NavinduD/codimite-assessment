// Handle the submission of new author form
function submitAuthorForm(event) {
    event.preventDefault();
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value
    };

    // Send POST request to create new author
    fetch("/authors", { 
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
        if (status === 500) {
            showToast('Server error: ' + body.error, 'error');
            return;
        }
        const tbody = document.querySelector('tbody');
        const noDataRow = tbody.querySelector('.no-data');
        if (noDataRow) {
            noDataRow.remove();
        }
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', body.id);
        tr.innerHTML = `
            <td>${body.id}</td>
            <td>${body.name}</td>
            <td>${body.email}</td>
            <td>
                <button class="edit-btn" onclick="editAuthor(${body.id})">Edit</button>
                <button class="delete-btn" onclick="deleteAuthor(${body.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
        document.getElementById('authorPopup').style.display = 'none';
        document.getElementById('authorForm').reset();
        showToast('Author added successfully!');
    })
    .catch(error => {
        showToast('Error: ' + error, 'error');
    });
}

// Populates the edit form with author data for editing
function editAuthor(id) {
    fetch(`/authors/${id}`)
        .then(response => response.json())
        .then(author => {
            document.getElementById('edit_author_id').value = author.id;
            document.getElementById('edit_name').value = author.name;
            document.getElementById('edit_email').value = author.email;
            document.getElementById('editAuthorPopup').style.display = 'block';
        });
}

// Handle the submission of edit author form
function submitEditAuthorForm(event) {
    event.preventDefault();
    const id = document.getElementById('edit_author_id').value;
    const formData = {
        name: document.getElementById('edit_name').value,
        email: document.getElementById('edit_email').value
    };

    // Send PUT request to update author
    fetch(`/authors/${id}`, {
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
            <td>${body.name}</td>
            <td>${body.email}</td>
            <td>
                <button class="edit-btn" onclick="editAuthor(${body.id})">Edit</button>
                <button class="delete-btn" onclick="deleteAuthor(${body.id})">Delete</button>
            </td>
        `;
        document.getElementById('editAuthorPopup').style.display = 'none';
        showToast('Author updated successfully!');
    });
}

// Handle author deletion with confirmation
function deleteAuthor(id) {
    showConfirmDialog('Are you sure you want to delete this author?', () => {
        // Send DELETE request to remove author
        fetch(`/authors/${id}`, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json().then(data => ({status: response.status, body: data})))
        .then(({status, body}) => {
            if (status === 400 || status === 404 || status === 500) {
                showToast(body.error, 'error');
                return;
            }

            // Remove author row and show empty message if needed
            const tbody = document.querySelector('tbody');
            const row = document.querySelector(`tr[data-id="${id}"]`);
            row.remove();

            // Add "No authors" message if table is empty
            if (tbody.children.length === 0) {
                const noDataRow = document.createElement('tr');
                noDataRow.innerHTML = '<td colspan="4" class="no-data">No authors available</td>';
                tbody.appendChild(noDataRow);
            }

            showToast('Author deleted successfully!');
        });
    });
}
