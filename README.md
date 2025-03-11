# Library Management System

A Flask-based REST API system for managing authors and books. The system implements full CRUD (Create, Read, Update, Delete) operations:
- Create new authors and books
- Read existing author and book information
- Update author and book details
- Delete authors and books from the system

## Setup Instructions

### Prerequisites
- Python 3.x
- pip (Python package installer)

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/NavinduD/codimite-assessment.git
cd codimite-assessment
```

2. Create and activate a virtual environment:
```bash
# Windows
python -m venv env
env\Scripts\activate

# Unix/MacOS
python -m venv env
source env/bin/activate
```

3. Install required dependencies:
```bash
pip install flask flask-sqlalchemy flask-scss
```

4. Run the application:
```bash
python app.py
```

The application will be available at `http://127.0.0.1:5000/`.

## API Endpoints

- `GET /authors` - List all authors
- `POST /authors` - Create a new author
- `GET /authors/<id>` - Get author details
- `PUT /authors/<id>` - Update author
- `DELETE /authors/<id>` - Delete author
- `GET /books` - List all books (supports pagination, filtering by genre and author)
- `POST /books` - Create a new book
- `GET /books/<id>` - Get book details
- `PUT /books/<id>` - Update book
- `DELETE /books/<id>` - Delete book

## Project Structure

```
codimite-assessment/
├── app.py           # Main application file
├── models/          # Database models
│   └── models.py
├── utils/          # Utility functions
│   └── validators.py
├── static/         # Static files (CSS, JS)
└── instance     # SQLite database file
    └── database.db
