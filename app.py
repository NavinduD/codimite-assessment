#imports
from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_scss import Scss
from models.models import db, Author, Book
from utils.validators import validate_author_data, validate_book_data

#app config
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'

#initialize db
db.init_app(app)

#initialize scss
Scss(app)

# Custom error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': str(error.description)}), 400

#routes
@app.route('/')
def index():
    return redirect(url_for('authors'))

# Author routes
@app.route('/authors', methods=['GET', 'POST'])
def authors():
    if request.method == 'POST':
        try:
            data = request.get_json()
            errors = validate_author_data(data)
            if errors:
                return jsonify({'errors': errors}), 400

            author = Author(name=data['name'], email=data['email'])
            db.session.add(author)
            db.session.commit()
            return jsonify({
                'id': author.id,
                'name': author.name,
                'email': author.email
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    else:  # GET request
        try:
            authors = Author.query.all()
            authors_list = [{'id': a.id, 'name': a.name, 'email': a.email} for a in authors]
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify(authors_list)
            return render_template('authors.html', authors=authors)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/authors/<int:id>', methods=['GET'])
def get_author(id):
    try:
        author = Author.query.get(id)
        if not author:
            return jsonify({'error': 'Author not found'}), 404
        return jsonify({
            'id': author.id,
            'name': author.name,
            'email': author.email
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/authors/<int:id>', methods=['PUT'])
def update_author(id):
    try:
        author = Author.query.get(id)
        if not author:
            return jsonify({'error': 'Author not found'}), 404

        data = request.get_json()
        errors = validate_author_data(data)
        if errors:
            return jsonify({'errors': errors}), 400

        author.name = data['name']
        author.email = data['email']
        db.session.commit()
        return jsonify({
            'id': author.id,
            'name': author.name,
            'email': author.email
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/authors/<int:id>', methods=['DELETE'])
def delete_author(id):
    try:
        # Find the author by ID, return 404 if not found
        author = Author.query.get(id)
        if not author:
            return jsonify({'error': 'Author not found'}), 404
            
        # Prevent deletion of authors with books linked to them
        if author.books:
            return jsonify({
                'error': 'Cannot delete author. Please delete all books associated with this author first.'
            }), 400
            
        db.session.delete(author)
        db.session.commit()
        return jsonify({'message': 'Author deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Book routes
@app.route('/books', methods=['GET', 'POST'])
def books():
    if request.method == 'POST':
        try:
            data = request.get_json()
            errors = validate_book_data(data)
            if errors:
                return jsonify({'errors': errors}), 400

            # Verify author exists
            author = Author.query.get(data['author_id'])
            if not author:
                return jsonify({'error': 'Author not found'}), 404

            book = Book(
                title=data['title'],
                genre=data['genre'],
                author_id=data['author_id']
            )
            db.session.add(book)
            db.session.commit()
            return jsonify({
                'id': book.id,
                'title': book.title,
                'genre': book.genre,
                'author_id': book.author_id,
                'author_name': book.author.name
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    else:  # GET request
        try:
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            genre = request.args.get('genre')
            author_id = request.args.get('author_id', type=int)

            query = Book.query

            if genre:
                query = query.filter(Book.genre.ilike(f'%{genre}%'))
            if author_id:
                query = query.filter(Book.author_id == author_id)

            pagination = query.paginate(page=page, per_page=per_page, error_out=False)
            books = pagination.items
            total_pages = pagination.pages
            total_items = pagination.total

            authors = Author.query.all()
            genres = db.session.query(Book.genre).distinct().all()
            genres = [g[0] for g in genres]

            books_list = [{
                'id': b.id,
                'title': b.title,
                'genre': b.genre,
                'author_id': b.author_id,
                'author_name': b.author.name
            } for b in books]

            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'books': books_list,
                    'pagination': {
                        'page': page,
                        'per_page': per_page,
                        'total_pages': total_pages,
                        'total_items': total_items
                    }
                })
            return render_template('books.html', 
                                books=books, 
                                authors=authors,
                                genres=genres,
                                current_page=page,
                                total_pages=total_pages,
                                per_page=per_page,
                                total_items=total_items)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/books/<int:id>', methods=['GET'])
def get_book(id):
    try:
        # Find the book by ID
        book = Book.query.get(id)
        if not book:
            return jsonify({'error': 'Book not found'}), 404
            
        return jsonify({
            'id': book.id,
            'title': book.title,
            'genre': book.genre,
            'author_id': book.author_id,
            'author_name': book.author.name
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/books/<int:id>', methods=['PUT'])
def update_book(id):
    try:
        book = Book.query.get(id)
        if not book:
            return jsonify({'error': 'Book not found'}), 404

        data = request.get_json()
        errors = validate_book_data(data)
        if errors:
            return jsonify({'errors': errors}), 400

        author = Author.query.get(data['author_id'])
        if not author:
            return jsonify({'error': 'Author not found'}), 404

        book.title = data['title']
        book.genre = data['genre']
        book.author_id = data['author_id']
        db.session.commit()
        return jsonify({
            'id': book.id,
            'title': book.title,
            'genre': book.genre,
            'author_id': book.author_id,
            'author_name': book.author.name
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/books/<int:id>', methods=['DELETE'])
def delete_book(id):
    try:
        book = Book.query.get(id)
        if not book:
            return jsonify({'error': 'Book not found'}), 404
        db.session.delete(book)
        db.session.commit()
        return jsonify({'message': 'Book deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

#run app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
    app.run(debug=True)

