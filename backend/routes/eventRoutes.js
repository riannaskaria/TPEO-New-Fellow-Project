const express = require('express');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const authenticateToken = require("../auth");

const Event = require('../models/event');
const User = require('../models/user');
const Org = require('../models/org');

const { getGridFsBucket } = require("../mongodb");

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

// Post new event
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { userId, orgId, title, date, startTime, endTime, location, description, categories, ticketInfo } = req.body;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Validate organization
		if(orgId && ObjectId.isValid(orgId)){
			const org = await Org.findById(orgId);
			if (!org) {
				return res.status(404).json({ 
					success: false, 
					message: 'Organization not found' 
				});
			}
		}

    // Convert date (yyyy-mm-dd) and time (hh:mm) strings into Date objects
    // Use Number() to convert string parts to numbers
    const [year, month, day] = date.split('-');
    const [startHour, startMinute] = startTime.split(':');
    const [endHour, endMinute] = endTime.split(':');

    const startDate = new Date(
      Number(year),
      Number(month) - 1, // month is 0-indexed
      Number(day),
      Number(startHour),
      Number(startMinute)
    );

    const endDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(endHour),
      Number(endMinute)
    );

    // Upload image to GridFS if an image file is provided
    let imageId = null;
    if (req.file) {
      const bucket = getGridFsBucket();
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
      });
      uploadStream.end(req.file.buffer);

      // Wait for the upload to complete
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      imageId = uploadStream.id;  // Save this ObjectId in your event
    }

    // Create new event document with converted Date objects
    const newEvent = new Event({
			author: userId,
			org: orgId && orgId.trim() !== "" ? orgId : undefined,
			title,
			startTime: startDate,
			endTime: endDate,
			location,
			description,
			categories: JSON.parse(categories || "[]"),
			ticketInfo,
			imageId
		});		

    const savedEvent = await newEvent.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: savedEvent
    });
  } catch (err) {
    console.error('Error creating event:', err);
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
router.put('/:id', authenticateToken, async (req, res) => {
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
  try {
    const { id } = req.params;

    // Validate ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    // Find and delete event
    const deletedEvent = await Event.findByIdAndDelete(id);

    // No event
    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: `No event found with ID: ${id}`
      });
    }

    // If event has an image, delete it from GridFS
    if (deletedEvent.imageId) {
      try {
        const bucket = getGridFsBucket();
        await bucket.delete(new ObjectId(deletedEvent.imageId));
      } catch (imgErr) {
        // Log but don't fail the whole request if image deletion fails
        console.error('Error deleting event image from GridFS:', imgErr);
      }
    }

    res.status(200).json({
      success: true,
      data: deletedEvent
    });
  } 
	catch (err) {
    console.error('Error deleting event:', err);
    res.status(400).json({
      success: false,
      message: 'Error deleting event', error: err.message
    });
  }
});

module.exports = router;