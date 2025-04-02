import unittest
from sqlalchemy import inspect
from sqlalchemy.orm.exc import NoResultFound
from app import app, db, Todo  # Import the Flask app, DB instance, and model from the app module

class TodoApiTest(unittest.TestCase):

    def setUp(self):
        # Configure test database
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        app.config["TESTING"] = True

        # Create and push an app context
        self.app_context = app.app_context()
        self.app_context.push()

        # Create test client and initialize schema
        self.client = app.test_client()
        db.drop_all()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.engine.dispose()
        self.app_context.pop()

    def test_create_and_get_todo(self):
        """Positive Test: Add a valid todo and retrieve it."""
        self.client.post("/api/todos", json={"task": "Test task"})
        res = self.client.get("/api/todos")
        todos = res.get_json()
        self.assertEqual(len(todos), 1)
        self.assertEqual(todos[0]["task"], "Test task")

    def test_update_todo(self):
        """Positive Test: Update a todo's completed status."""
        self.client.post("/api/todos", json={"task": "Original"})
        self.client.put("/api/todos/1", json={"completed": True})
        res = self.client.get("/api/todos")
        self.assertTrue(res.get_json()[0]["completed"])

    def test_delete_todo(self):
        """Positive Test: Delete a todo and confirm it's gone."""
        self.client.post("/api/todos", json={"task": "To be deleted"})
        self.client.delete("/api/todos/1")
        res = self.client.get("/api/todos")
        self.assertEqual(len(res.get_json()), 0)

    def test_submit_blank_task(self):
        """Negative Test: Submitting a blank task should return 400."""
        res = self.client.post("/api/todos", json={"task": ""})
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", res.get_json())

    def test_create_long_task(self):
        """Edge Case Test: Create a task with 1000+ characters."""
        long_text = "a" * 1500  # Extremely long task name
        res = self.client.post("/api/todos", json={"task": long_text})
        self.assertEqual(res.status_code, 201)
        todos = self.client.get("/api/todos").get_json()
        self.assertEqual(todos[0]["task"], long_text)

    def test_create_valid_task_shows_in_list(self):
        """Positive Test: Creating a valid task adds it to the list."""
        self.client.post("/api/todos", json={"task": "Walk the dog"})
        res = self.client.get("/api/todos")
        todos = res.get_json()
        self.assertTrue(any(t["task"] == "Walk the dog" for t in todos))

if __name__ == "__main__":
    unittest.main()
