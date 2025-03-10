const express = require("express");
const { connectDB, getDB } = require("./mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000", // Allow frontend to access backend
    methods: "GET,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.use(express.json());

const initializeApp = async () => {
  await connectDB();

  // Default endpoint
  app.get("/", (req, res) => {
    res.send("Hello from the backend!");
  });

  // GET all users
  app.get("/users", async (req, res) => {
    try {
      const db = getDB();
      const users = await db.collection("users").find({}).toArray();
      res.json({ success: true, count: users.length, data: users });
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ success: false, error: "Server Error" });
    }
  });

  // GET user by username (for login)
  app.get("/users/username/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const db = getDB();
      const user = await db.collection("users").findOne({ username });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `No user found with username: ${username}`,
        });
      }

      res.json({ success: true, data: user });
    } catch (err) {
      console.error("Error fetching user by username:", err);
      res.status(500).json({ success: false, error: "Server Error" });
    }
  });

  // POST (Register a new user)
  app.post("/users", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: "Username and password are required",
        });
      }

      const db = getDB();
      const usersCollection = db.collection("users");

      // Check if the user already exists
      const existingUser = await usersCollection.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Username already taken",
        });
      }

      // Save user
      const newUser = { username, password };
      await usersCollection.insertOne(newUser);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    } catch (err) {
      console.error("Error adding new user:", err);
      res.status(500).json({ success: false, error: "Server Error" });
    }
  });

  // POST (Login user)
  app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing username or password" });
    }

    try {
      const db = getDB();
      const user = await db.collection("users").findOne({ username });

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ message: "Login successful", user });
    } catch (err) {
      console.error("Error logging in user:", err);
      res.status(500).json({ error: "Server Error" });
    }
  });

  // DELETE user
  app.delete("/users/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const db = getDB();
      const result = await db.collection("users").deleteOne({ username });

      if (result.deletedCount === 0) {
        return res.status(400).json({
          success: false,
          error: `User "${username}" not found`,
        });
      }

      res.json({
        success: true,
        message: `User "${username}" deleted successfully`,
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ success: false, error: "Server Error" });
    }
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

initializeApp().catch((err) => {
  console.error("Failed to initialize server:", err);
  process.exit(1);
});
