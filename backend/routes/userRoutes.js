const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
require('dotenv').config();

const { ObjectId } = require('mongodb');
const authenticateToken = require("../auth");

const User = require('../models/user');

const { getGridFsBucket } = require("../mongodb");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Get all users
router.get('/', authenticateToken, async (req, res) => {
	try{
		// Find all users
		const users = await User.find({});

		// No users
		if (!users) {
			return res.status(404).json({
				success: false,
				message: 'No users found'
			});
		}

		res.status(200).json({
			success: true,
			data: users
		});
	}
	catch(err){
		console.error('Error fetching users:', err);
		res.status(500).json({
			success: false,
			message: 'Error fetching users',
			error: err.message
		});
	}
});

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
router.post('/', upload.single('profilePicture'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      majors,
      year,
      savedEvents,
      orgs,
      friends,
      friendRequests,
      interests
    } = req.body;

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

    // Upload the profile picture to GridFS if a file was provided
    let profilePictureId = null;
    if (req.file) {
      const bucket = getGridFsBucket();

			const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
      });

			uploadStream.end(req.file.buffer);

      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      profilePictureId = uploadStream.id;
    }

    // Create a new user with the provided details and the uploaded profile picture id
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      majors,
      year,
      savedEvents,
      orgs,
      friends,
      friendRequests,
      interests,
      profilePicture: profilePictureId
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: savedUser
    });
  } 
	catch (err) {
    console.error('Error creating user:', err);

    // Handle Mongoose validation errors
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
router.put('/:id', upload.single('profilePicture'), async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the user ID format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Prepare user data update from request body
    const newUserData = { ...req.body };

    // If a new profile picture is provided, handle the image upload
    if (req.file) {
      const bucket = getGridFsBucket();

      // Retrieve the existing user to check for an existing image
      const existingUser = await User.findById(id);
      if (existingUser && existingUser.profilePicture) {
        // Delete the current profile picture from GridFS
        try {
          await bucket.delete(existingUser.profilePicture);
        } catch (deleteErr) {
          console.error('Error deleting existing profile picture:', deleteErr);
          // You might choose to continue or handle the error differently based on your requirements.
        }
      }

      // Upload the new profile picture to GridFS
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
      });
      uploadStream.end(req.file.buffer);

      // Wait for the upload to finish
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      // Set the new profile picture id in the update data
      newUserData.profilePicture = uploadStream.id;
    }

    // Update the user document in the database
    const updatedUser = await User.findByIdAndUpdate(
      id,
      newUserData,
      { new: true, runValidators: true, strict: "throw" }
    );
    
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
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(400).json({
      success: false,
      message: 'Error updating user',
      error: err.message
    });
  }
});

// GET image by imageId
router.get('/image/:id', async (req, res) => {
	try {
		const { id } = req.params;
		if (!ObjectId.isValid(id)) {
			return res.status(400).json({ success: false, message: 'Invalid image id format' });
		}

		const bucket = getGridFsBucket();
		const downloadStream = bucket.openDownloadStream(new ObjectId(id));

		res.set('Content-Type', 'application/octet-stream');

		downloadStream.on('data', (chunk) => {
			res.write(chunk);
		});

		downloadStream.on('error', (err) => {
			console.error(err);
			res.status(404).json({ success: false, message: 'Image not found' });
		});

		downloadStream.on('end', () => {
			res.end();
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: 'Error retrieving image', error: err.message });
	}
});

module.exports = router;