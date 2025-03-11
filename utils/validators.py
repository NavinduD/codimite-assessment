def validate_author_data(data):
    errors = []
    if not data.get('name'):
        errors.append('Name is required')
    if not data.get('email'):
        errors.append('Email is required')
    elif not '@' in data.get('email'):
        errors.append('Invalid email format')
    return errors

def validate_book_data(data):
    errors = []
    if not data.get('title'):
        errors.append('Title is required')
    if not data.get('genre'):
        errors.append('Genre is required')
    if not data.get('author_id'):
        errors.append('Author is required')
    return errors
