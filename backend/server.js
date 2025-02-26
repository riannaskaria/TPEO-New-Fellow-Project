const express = require("express");
const {connectDB, getDB} = require('./mongodb');
const cors = require("cors");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;	

app.use(cors());
app.use(express.json());

// Connect to MongoDB before setting up routes
const initializeApp = async () => {
	await connectDB();
	
	// Default endpoint
	app.get('/', (req, res) => {
		res.send('Hello from the backend!');
	});

	// GET endpoint to retrieve all users
	app.get('/users', async (req, res) => {
	  try {
		const db = getDB();
		const usersCollection = db.collection('users');
		
		const users = await usersCollection.find({}).toArray();
		
		res.json({
		  success: true,
		  count: users.length,
		  data: users
		});
	  } 
	  catch (err) {
		console.error('Error fetching users:', err);
		res.status(500).json({
		  success: false,
		  error: 'Server Error'
		});
	  }
	});

	// GET endpoint to retrieve a user by username
	app.get('/users/username/:username', async (req, res) => {
		try {
			const { username } = req.params;
			const db = getDB();
			const usersCollection = db.collection('users');
			
			// Find documents in the users collection with matching username
			const users = await usersCollection.find({ username }).toArray();
			
			if (users.length === 0) {
				return res.status(404).json({
				success: false,
				message: `No user found with username: ${username}`
				});
			}
			
			res.json({
				success: true,
				count: users.length,
				data: users
			});
		} 
		catch (err) {
			console.error('Error fetching user by username:', err);
			res.status(500).json({
				success: false,
				error: 'Server Error'
			});
		}
	});
  
	// Middleware to validate username
	const validateUsername = (req, res, next) => {
		const { username } = req.body;
		console.log(JSON.stringify(username));

		// Check if username exists
		if (!username) {
			return res.status(400).json({
				success: false,
				error: 'Username is required'
			});
		}

		// Check if username is a string
		if (typeof username !== 'string') {
			return res.status(400).json({
				success: false,
				error: 'Username must be a string'
			});
		}

		// Check if username is not empty after trimming
		if (username.trim() === '') {
			return res.status(400).json({
				success: false,
				error: 'Username cannot be empty'
			});
		}

		// If all validations pass, proceed to the next middleware/route handler
		next();
	};

	// POST endpoint to add a new user with MongoDB ObjectId
	app.post('/users', validateUsername, async (req, res) => {
		try {
			const { username } = req.body;
			
			const db = getDB();
			const usersCollection = db.collection('users');
			
			// Create the new user document (only with username field)
			const newUser = {username};
			
			const result = await usersCollection.insertOne(newUser);
			
			res.status(201).json({
				success: true,
				data: newUser,
				message: 'User added successfully'
			});
		} 
		catch (err) {
			console.error('Error adding new user:', err);
			res.status(500).json({
				success: false,
				error: 'Server Error'
			});
		}
	});
  
	app.delete('/users/:username', async (req, res) => {
		try{
			const {username} = req.params;

			if(!username || username.trim() === ''){
				return res.status(400).json({
					success: false,
					error: 'Valid username is required'
				});
			}

			const db = getDB();
			const usersCollection = db.collection('users');

			const result = await usersCollection.deleteOne({ username });

			if(result.deletedCount === 0){
				return res.status(400).json({
					success: false,
        			error: `User with username \"${username}\" not found`
				});
			}

			res.json({
				success: true,
				message: `User "${username}" successfully deleted`,
				deletedCount: result.deletedCount
			});
		}
		catch (err){
			console.error('Error deleting user:', err);
			res.status(500).json({
				success: false,
				error: 'Server Error'
			});
		}
	});
  
	// Start server
	app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);});
};
  
initializeApp().catch(err => {
	console.error('Failed to initialize server:', err);
	process.exit(1);
});