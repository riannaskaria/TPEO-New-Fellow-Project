const express = require('express');
const { getDB } = require("../mongodb");
const authenticateToken = require("../auth");

const router = express.Router();

// Get all categories
router.get("/", authenticateToken, async (req, res) => {
	try{
		// Retrieve categories collection
		const db = getDB();
		const categoriesCollection = db.collection('categories');
		
		// Get all categories
		const categories = await categoriesCollection.findOne({});

		// No categories
		if (!categories) {
			return res.status(404).json({
				success: false,
				message: `No categories document found`
			});
		}
		
		res.status(200).json({
			success: true,
			data: categories
		});
	}
	catch(err){
		console.error('Error fetching categories:', err);
		res.status(500).json({
			success: false,
			message: 'Error fetching categories',
			error: err.message
		});
	}
});

module.exports = router;