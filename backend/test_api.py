import unittest
from sqlalchemy import inspect
from sqlalchemy.orm.exc import NoResultFound
from app import app, db, Todo  # Import the Flask app, DB instance, and model from the app module

# Define a class for API tests using Python's built-in unittest framework
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
        db.engine.dispose()  # Force close any lingering SQLite connections
        self.app_context.pop()
    
    def test_create_and_get_todo(self):
        """
        Test the creation of a todo and then retrieving it via GET.
        """
        # Send POST request to create a new todo
        self.client.post("/api/todos", json={"task": "Test task"})

        # Send GET request to retrieve all todos
        res = self.client.get("/api/todos")
        todos = res.get_json()

        # Assertions: make sure exactly one todo exists and it matches what we sent
        self.assertEqual(len(todos), 1)
        self.assertEqual(todos[0]["task"], "Test task")

    def test_update_todo(self):
        """
        Test updating a todo to mark it as completed.
        """
        # First, create a todo
        self.client.post("/api/todos", json={"task": "Original"})

        # Send PUT request to update the todo's "completed" status
        self.client.put("/api/todos/1", json={"completed": True})

        # GET to confirm the update took effect
        res = self.client.get("/api/todos")
        self.assertTrue(res.get_json()[0]["completed"])  # Should be True

    def test_delete_todo(self):
        """
        Test deleting a todo and confirming it's removed.
        """
        # Create a todo to be deleted
        self.client.post("/api/todos", json={"task": "To be deleted"})

        # Send DELETE request for todo with ID 1
        self.client.delete("/api/todos/1")

        # GET all todos and assert it's empty
        res = self.client.get("/api/todos")
        self.assertEqual(len(res.get_json()), 0)  # All todos should be gone

# Entry point to run the test suite
if __name__ == "__main__":
    unittest.main()
