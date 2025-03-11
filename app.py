#imports
from flask import Flask, render_template, request, redirect, url_for
from flask_scss import Scss
from flask_sqlalchemy import SQLAlchemy

#app config
app = Flask(__name__)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'

# #initialize db
# db = SQLAlchemy(app)

# #initialize scss
# Scss(app)

#routes
@app.route('/')
def index():
    return render_template('index.html')

#run app
if __name__ == '__main__':
    app.run(debug=True)

