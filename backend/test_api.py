import unittest
from app import app, db, Todo

class TodoApiTest(unittest.TestCase):
    def setUp(self):
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        app.config["TESTING"] = True
        self.client = app.test_client()
        with app.app_context():
            db.create_all()

    def test_create_and_get_todo(self):
        self.client.post("/api/todos", json={"task": "Test task"})
        res = self.client.get("/api/todos")
        todos = res.get_json()
        self.assertEqual(len(todos), 1)
        self.assertEqual(todos[0]["task"], "Test task")

    def test_update_todo(self):
        self.client.post("/api/todos", json={"task": "Original"})
        self.client.put("/api/todos/1", json={"completed": True})
        res = self.client.get("/api/todos")
        self.assertTrue(res.get_json()[0]["completed"])

    def test_delete_todo(self):
        self.client.post("/api/todos", json={"task": "To be deleted"})
        self.client.delete("/api/todos/1")
        res = self.client.get("/api/todos")
        self.assertEqual(len(res.get_json()), 0)

if __name__ == "__main__":
    unittest.main()
