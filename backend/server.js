const express = require("express");
const { connectDB, getDB } = require("./mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken"); // Add this package
const bcrypt = require("bcrypt"); // Add this package for password hashing
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Add this line

app.use(
  cors({
    origin: "http://localhost:3000", // Allow frontend to access backend
    methods: "GET,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Get token from Bearer header

  if (!token) {
    return res.status(401).json({ success: false, error: "Access denied. Token required." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
};

const initializeApp = async () => {
  await connectDB();

  // Default endpoint
  app.get("/", (req, res) => {
    res.send("Hello from the backend!");
  });

  // GET all users - Protected route
  app.get("/users", authenticateToken, async (req, res) => {
    try {
      const db = getDB();
      const users = await db.collection("users").find({}).project({ password: 0 }).toArray(); // Don't return passwords
      res.json({ success: true, count: users.length, data: users });
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ success: false, error: "Server Error" });
    }
  });

  // GET user by username (for login)
  app.get("/users/username/:username", authenticateToken, async (req, res) => {
    try {
      const { username } = req.params;
      const db = getDB();
      const user = await db.collection("users").findOne({ username }, { projection: { password: 0 } });

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

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Save user with hashed password
      const newUser = { username, password: hashedPassword };
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

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Compare passwords
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Create and sign a JWT token
      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: "Login successful",
        user: userWithoutPassword,
        token
      });
    } catch (err) {
      console.error("Error logging in user:", err);
      res.status(500).json({ error: "Server Error" });
    }
  });

  // DELETE user - Protected route
  app.delete("/users/:username", authenticateToken, async (req, res) => {
    try {
      const { username } = req.params;

      // Only allow users to delete their own account or admin users
      if (req.user.username !== username && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: "Not authorized to delete this user"
        });
      }

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

  // Get authenticated user profile
  app.get("/me", authenticateToken, async (req, res) => {
    try {
      const db = getDB();
      const user = await db.collection("users").findOne(
        { username: req.user.username },
        { projection: { password: 0 } } // Don't return the password
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (err) {
      console.error("Error fetching user profile:", err);
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
