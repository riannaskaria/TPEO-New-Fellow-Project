const jwt = require('jsonwebtoken');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
	throw new Error('Missing JWT_SECRET environment variable');
}

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1]; // Get token from Bearer header
  
	if (!token) {
	  	return res.status(401).json({ 
			success: false, 
			error: "Access denied. Token required." 
		});
	}
  
	try {
		const verified = jwt.verify(token, JWT_SECRET);
		req.user = verified;
		next();
	} 
	catch (err) {
	  	res.status(401).json({ 
			success: false, 
			error: "Invalid or expired token" 
		});
	}
};

module.exports = authenticateToken;