from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db, Todo

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///todos.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
CORS(app)  # Enable CORS for frontend access

# Create DB if not exists
with app.app_context():
    db.create_all()

# ========== Routes ==========
@app.route("/")
def index():
    return "Flask API is running. Use /api/todos to access the Todo API."

@app.route("/api/todos", methods=["GET"])
def get_todos():
    todos = Todo.query.all()
    return jsonify([todo.to_dict() for todo in todos])

@app.route("/api/todos", methods=["POST"])
def create_todo():
    data = request.get_json()
    if not data or "task" not in data:
        return jsonify({"error": "Missing 'task'"}), 400
    todo = Todo(task=data["task"])
    db.session.add(todo)
    db.session.commit()
    return jsonify(todo.to_dict()), 201

@app.route("/api/todos/<int:todo_id>", methods=["PUT"])
def update_todo(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    data = request.get_json()
    todo.task = data.get("task", todo.task)
    todo.completed = data.get("completed", todo.completed)
    db.session.commit()
    return jsonify({"message": "Todo updated"})

@app.route("/api/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    db.session.delete(todo)
    db.session.commit()
    return jsonify({"message": "Todo deleted"})

if __name__ == "__main__":
    app.run(debug=True)
