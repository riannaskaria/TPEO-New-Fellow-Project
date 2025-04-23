const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Database and routes requirements
const { connectDB } = require('./mongodb');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const orgRoutes = require('./routes/orgRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Get app instance
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Configure middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const initializeApp = async () => {
  // Connect to MongoDB before setting up routes
  await connectDB();

  // Default route
  app.get('/', (req, res) => {
    res.send('Hello from the backend!');
  });

  // Collections routes
  app.use('/users', userRoutes);
  app.use('/events', eventRoutes);
  app.use('/orgs', orgRoutes);
  app.use('/categories', categoryRoutes);
};

// Initialize routes and database connection
initializeApp().catch(err => {
  console.error('Failed to initialize server:', err);
  process.exit(1);
});

// Export the app for serverless deployment
module.exports = app;
