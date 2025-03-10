const express = require('express');
const { ObjectId } = require('mongodb');
const authenticateToken = require("../auth");

const Org = require('../models/org');

const router = express.Router();

// Get all orgs
router.get("/", authenticateToken, async (req, res) => {
	try{
		// Find all orgs
		const orgs = await Org.find({});

		// No orgs
		if (!orgs) {
			return res.status(404).json({
				success: false,
				message: 'No organizations found'
			});
		}
		
		res.status(200).json({
			success: true,
			data: orgs
		});
	}
	catch(err){
		console.error('Error fetching organizations:', err);
		res.status(500).json({
			success: false,
			message: 'Error fetching organizations',
			error: err.message
		});
	}
});

// Get org by ID
router.get("/:id", authenticateToken, async (req, res) => {
	try{
		const { id } = req.params;

		// Validate ID
		if(!ObjectId.isValid(id)){
			return res.status(400).json({
				success: false,
				message: 'Invalid organization ID format'
			});
		}

		// Find org in orgs collection with matching ID
		const org = await Org.findById(id);

		// No org
		if (!org) {
			return res.status(404).json({
				success: false,
				message: `No organization found with ID: ${id}`
			});
		}
		
		res.status(200).json({
			success: true,
			data: org
		});
	}
	catch(err){
		console.error('Error fetching organization by ID:', err);
		res.status(500).json({
			success: false,
			message: 'Error fetching organization by ID',
			error: err.message
		});
	}
});

// Post new org
router.post("/", authenticateToken, async (req, res) => {
	try{
		const { name } = req.body;

		// Create new org
		const newOrg = new Org({
			name
		});

		// Post new org
		const savedOrg = await newOrg.save();

		res.status(201).json({
			success: true,
			message: 'Organization created successfully',
			org: savedOrg
		});
	}
	catch(err){
		console.error('Error creating organization:', err);

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
			message: 'Error creating organization',
			error: err.message
		});
	}
});

module.exports = router;