const express = require('express');
const { ObjectId } = require('mongodb');
const authenticateToken = require("../auth");

const Org = require('../models/org');

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
	try{
		const orgs = await Org.find({});

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

router.get("/:id", authenticateToken, async (req, res) => {
	try{
		const { id } = req.params;

		if(!ObjectId.isValid(id)){
			return res.status(400).json({
				success: false,
				message: 'Invalid organization ID format'
			});
		}

		const org = await Org.findById(id);

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

router.post("/", authenticateToken, async (req, res) => {
	try{
		const { name } = req.body;

		const newOrg = new Org({
			name
		});

		const savedOrg = await newOrg.save();

		res.status(201).json({
			success: true,
			message: 'Organization created successfully',
			org: savedOrg
		});
	}
	catch(err){
		console.error('Error creating organization:', err);

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