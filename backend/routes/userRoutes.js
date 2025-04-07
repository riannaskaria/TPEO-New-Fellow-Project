const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { ObjectId } = require('mongodb');
const authenticateToken = require("../auth");

const User = require('../models/user');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;

		// Validate ID
		if(!ObjectId.isValid(id)){
			return res.status(400).json({
				success: false,
				message: 'Invalid user ID format'
			});
		}

		// Find user in the users collection with matching id and exclude password attribute
		const user = await User.findById(id).select('-password');

		// No user found
		if (!user) {
			return res.status(404).json({
				success: false,
				message: `No user found with ID: ${id}`
			});
		}

		res.status(200).json({
			success: true,
			data: user
		});
	}
	catch (err) {
		console.error('Error fetching user by ID:', err);
		res.status(500).json({
			success: false,
			message: 'Error fetching user by ID',
			error: err.message
		});
	}
});

// Register a new user
router.post('/', async (req, res) => {
	try{
		const { username, email, password, majors, year, savedEvents, orgs, friends, friendRequests, interests } = req.body;

		// Validate that email ends with @utexas.edu
		const emailRegex = /^[a-zA-Z0-9._%+-]+@utexas\.edu$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({
				success: false,
				error: "Invalid email: Must be a UT Austin email (@utexas.edu).",
			});
		}

		// Check if the user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				error: "Error registering user: email already taken",
			});
		}

		// Hash the password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create new user
		const newUser = new User({
			username,
			email,
			password: hashedPassword,
			majors,
			year,
			savedEvents,
			orgs,
			friends,
			friendRequests,
			interests
		});

		// Post the user
		const savedUser = await newUser.save();

		res.status(201).json({
			success: true,
			message: 'User created successfully',
			event: savedUser

		});
	}
	catch(err){
		console.error('Error creating user:', err);

		// Invalid format
		if (err.name === 'ValidationError') {
			return res.status(400).json({
				success: false,
				message: 'Validation error',
				error: err.message
			});
		  }

		res.status(400).json({
			success: false,
			message: 'Error creating user',
			error: err.message
		});
	}
});

// Login user
router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	// Check that email and password exists
	if (!email || !password) {
		return res.status(400).json({
			success: false,
			error: "Error logging in user: missing email or password"
		});
	}

	try{
		const user = await User.findOne({ email });

		// No user
		if (!user) {
			return res.status(401).json({
				success: false,
				error: `Invalid credentials: no user found with email ${email}`
			});
		}

		// Compare passwords
		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) {
			return res.status(401).json({
				success: false,
				error: `Invalid credentials: incorrect password for ${email}`
			});
		}

		// Create and sign a JWT token
		const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

		// Remove password from user object
		const { password: _, ...userWithoutPassword } = user._doc;

		res.status(201).json({
			message: "Login successful",
			user: userWithoutPassword,
			token
		});
	}
	catch(err){
		console.error("Error logging in user:", err);
    res.status(400).json({
			success: false,
			error: err.message
		});
	}
});

// Update user by ID
router.put('/:id', async (req, res) => {
	try{
		const { id } = req.params;
		const newUserData = req.body;

		// Validate ID
		if(!ObjectId.isValid(id)){
			return res.status(400).json({
				success: false,
				message: 'Invalid user ID format'
			});
		}

		// Update user data
		const updatedUser = await User.findByIdAndUpdate(
			id,
			newUserData,
			{ new: true, runValidators: true, strict: "throw" }
		);

		// No user
		if (!updatedUser) {
			return res.status(404).json({
				success: false,
				message: `No user found with ID: ${id}`
			});
		}

		res.status(200).json({
			success: true,
			data: updatedUser
		});
	}
	catch(err){
		console.error('Error updating event:', err);
    res.status(400).json({
			success: false,
			message: 'Error updating event', error: err.message
		});
	}
});

router.delete('/delete', async (req, res) => {
	try {
	  const { email } = req.body;

	  // Validate email
	  if (!email) {
		return res.status(400).json({ success: false, message: 'Email is required' });
	  }

	  const user = await User.findOneAndDelete({ email });
	  if (!user) {
		return res.status(404).json({ success: false, message: 'User not found' });
	  }

	  res.status(200).json({ success: true, message: 'User deleted successfully' });
	} catch (err) {
	  console.error('Error deleting user:', err);
	  res.status(500).json({ success: false, message: 'Error deleting user', error: err.message });
	}
  });


module.exports = router;