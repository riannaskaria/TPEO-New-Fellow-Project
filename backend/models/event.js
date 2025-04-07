const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	org: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Org'
	},
	title: {type: String, required: true},
	startTime: {type: Date, required: true},
	endTime: {type: Date, required: true},
	location: {type: String, required: true},
	description: {type: String, required: true},
	categories: [{type: String, required: true}],
	ticketInfo: {type: String},
	imageId: { type: mongoose.Schema.Types.ObjectId }
}, {
	timestamps: true,
	versionKey: false,
});

const Event = mongoose.model('Event', eventSchema, 'events');

module.exports = Event;