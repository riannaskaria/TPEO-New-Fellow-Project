const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	org: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Org',
		required: true
	},
	title: {type: String, required: true},
	date: {type: Date, required: true},
	location: {type: String, required: true},
	description: {type: String, required: true},
	categories: [{type: String, required: true}]
}, {
	timestamps: true,
	versionKey: false,
});

const Event = mongoose.model('Event', eventSchema, 'events');

module.exports = Event;