const express = require('express');
const { ObjectId } = require('mongodb');
const authenticateToken = require("../auth");

const Event = require('../models/event');
const User = require('../models/user');
const Org = require('../models/org');

const router = express.Router();

// Get all events
router.get('/', authenticateToken, async (req, res) => {
	try{
		// Find all events
		const events = await Event.find({});

		// No events
		if (!events) {
			return res.status(404).json({
				success: false,
				message: 'No events found'
			});
		}

		res.status(200).json({
			success: true,
			data: events
		});
	}
	catch(err){
		console.error('Error fetching events:', err);
		res.status(500).json({
			success: false,
			message: 'Error fetching events',
			error: err.message
		});
	}
});

// Get event by ID
router.get('/:id', authenticateToken, async (req, res) => {
	try{
		const { id } = req.params;

		// Validate ID
		if(!ObjectId.isValid(id)){
			return res.status(400).json({
				success: false,
				message: 'Invalid event ID format'
			});
		}

		// Find event in the events collection with matching id
		const event = await Event.findById(id);

		// No event
		if (!event) {
			return res.status(404).json({
				success: false,
				message: `No event found with ID: ${id}`
			});
		}

		res.status(200).json({
			success: true,
			data: event
		});
	}
	catch(err){
		console.error('Error fetching event by ID:', err);
		res.status(500).json({
			success: false,
			message: 'Error fetching event by ID',
			error: err.message
		});
	}
});

// Get event by user ID
router.get('/user/:userId', authenticateToken, async (req, res) => {
	try{
		const { userId } = req.params;

		// Validate ID
		if(!ObjectId.isValid(userId)){
			return res.status(400).json({
				success: false,
				message: 'Invalid user ID format'
			});
		}

		// Find events with matching user ID
		const events = await Event.find({ author: new ObjectId(userId) });

		// No events
		if (!events) {
			return res.status(404).json({
				success: false,
				message: `No events found with user ID: ${id}`
			});
		}

		res.status(200).json({
			success: true,
			data: events
		});
	}
	catch(err){
		console.error('Error fetching events by user ID:', err);
		res.status(500).json({
			success: false,
			message: 'Error fetching events by user ID',
			error: err.message
		});
	}
});

// Post new event
router.post('/', authenticateToken, async (req, res) => {
	try{
		const {userId, orgId, title, date, location, description, categories} = req.body;

		// Invalid user ID
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		// Invalid org ID
		const org = await Org.findById(orgId);
		if (!org) {
			return res.status(404).json({
				success: false,
				message: 'Organization not found'
			});
		}

		// Create new event
		const newEvent = new Event({
			author: userId,
			org: orgId,
			title,
			date,
			location,
			description,
			categories
		});

		// Post new event
		const savedEvent = await newEvent.save();

		res.status(201).json({
			success: true,
			message: 'Event created successfully',
			event: savedEvent
		});
	}
	catch(err){
		console.error('Error creating event:', err);

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
			message: 'Error creating event',
			error: err.message
		});
	}
});

// Update event by ID
router.put('/:id', async (req, res) => {
	try{
		const { id } = req.params;
		const newEventData = req.body;

		// Validate ID
		if(!ObjectId.isValid(id)){
			return res.status(400).json({
				success: false,
				message: 'Invalid event ID format'
			});
		}

		// Update event with strict schema
		const updatedEvent = await Event.findByIdAndUpdate(
			id,
			newEventData,
			{ new: true, runValidators: true, strict: "throw" }
		);

		// No event to update
		if (!updatedEvent) {
			return res.status(404).json({
				success: false,
				message: `No event found with ID: ${id}`
			});
		}

		res.status(200).json({
			success: true,
			data: updatedEvent
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

// Delete event by ID
router.delete('/:id', async (req, res) => {
	try{
		const { id } = req.params;

		// Validate ID
		if(!ObjectId.isValid(id)){
			return res.status(400).json({
				success: false,
				message: 'Invalid event ID format'
			});
		}

		// Delete event
		const deletedEvent = await Event.findByIdAndDelete(id);

		// No event
		if (!deletedEvent) {
			return res.status(404).json({
				success: false,
				message: `No event found with ID: ${id}`
			});
		}

		res.status(200).json({
			success: true,
			data: deletedEvent
		});
	}
	catch(err){
		console.error('Error deleting event:', err);
    res.status(400).json({
			success: false,
			message: 'Error deleting event', error: err.message
		});
	}
});

module.exports = router;