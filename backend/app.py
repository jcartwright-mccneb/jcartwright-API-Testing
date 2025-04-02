# Import necessary modules from Flask
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Import the database instance and the Todo model from a separate module
from models import db, Todo

# Initialize the Flask application
app = Flask(__name__)

# Configure the SQLite database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///todos.db"  # Local DB file
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False  # Disable signal tracking (saves memory/performance)

# Bind the SQLAlchemy object (db) to this app
db.init_app(app)

# Enable Cross-Origin Resource Sharing so the frontend (on a different port) can communicate with the backend
CORS(app)

# Ensure the database is created when the app context is available (e.g., first time setup)
with app.app_context():
    db.create_all()

# -------------------------------
# ROUTES
# -------------------------------

# Health check root endpoint
@app.route("/")
def index():
    return "Flask API is running. Use /api/todos to access the Todo API."

# GET all todos
@app.route("/api/todos", methods=["GET"])
def get_todos():
    # Query all todos from the database
    todos = Todo.query.all()
    # Convert each todo to dictionary format and return JSON response
    return jsonify([todo.to_dict() for todo in todos])

# POST a new todo
@app.route("/api/todos", methods=["POST"])
def create_todo():
    # Parse JSON data from the incoming request
    data = request.get_json()

    # Validate that "task" is included in the request
    if not data or "task" not in data or not data["task"].strip():
        return jsonify({"error": "Task is required and cannot be empty"}), 400
        
    # Create a new Todo object
    todo = Todo(task=data["task"])

    # Add and commit to the database
    db.session.add(todo)
    db.session.commit()

    # Return the created todo and a 201 Created status
    return jsonify(todo.to_dict()), 201

# PUT to update an existing todo by ID
@app.route("/api/todos/<int:todo_id>", methods=["PUT"])
def update_todo(todo_id):
    # Fetch the todo by ID or return 404
    todo = Todo.query.get_or_404(todo_id)

    # Get the updated data from the request
    data = request.get_json()

    # Update fields only if provided
    todo.task = data.get("task", todo.task)
    todo.completed = data.get("completed", todo.completed)

    # Commit changes to the database
    db.session.commit()

    # Return confirmation message
    return jsonify({"message": "Todo updated"})

# DELETE a todo by ID
@app.route("/api/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    # Fetch the todo or return 404 if not found
    todo = Todo.query.get_or_404(todo_id)

    # Delete from the session and commit the change
    db.session.delete(todo)
    db.session.commit()

    # Return confirmation message
    return jsonify({"message": "Todo deleted"})

# Entry point when running the file directly
if __name__ == "__main__":
    # Start the Flask development server with debug mode enabled
    app.run(debug=True)
