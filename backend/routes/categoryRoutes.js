const express = require('express');
const { getDB } = require("../mongodb");
const authenticateToken = require("../auth");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
	try{
		const db = getDB();
		const categoriesCollection = db.collection('categories');
		
		const categories = await categoriesCollection.findOne({});

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