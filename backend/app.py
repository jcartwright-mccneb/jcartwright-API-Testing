from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite3"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app)  # Enable CORS so React can talk to the backend

db = SQLAlchemy(app)

# Model
class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)

# Create DB
with app.app_context():
    db.create_all()

# Routes
@app.route("/api/todos", methods=["GET"])
def get_todos():
    todos = Todo.query.all()
    return jsonify([{"id": t.id, "task": t.task, "completed": t.completed} for t in todos])

@app.route("/api/todos", methods=["POST"])
def add_todo():
    data = request.get_json()
    todo = Todo(task=data["task"])
    db.session.add(todo)
    db.session.commit()
    return jsonify(id=todo.id, task=todo.task, completed=todo.completed), 201

@app.route("/api/todos/<int:id>", methods=["PUT"])
def update_todo(id):
    todo = Todo.query.get_or_404(id)
    data = request.get_json()
    todo.task = data.get("task", todo.task)
    todo.completed = data.get("completed", todo.completed)
    db.session.commit()
    return jsonify(message="Todo updated")

@app.route("/api/todos/<int:id>", methods=["DELETE"])
def delete_todo(id):
    todo = Todo.query.get_or_404(id)
    db.session.delete(todo)
    db.session.commit()
    return jsonify(message="Todo deleted")

if __name__ == "__main__":
    app.run(debug=True)
