const mongoose = require('mongoose');
const { Int32 } = require('mongodb');

const userSchema = new mongoose.Schema({
	username: {type: String, required: true},
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true},
	majors: [{type: String, required: true}],
	year: {
		type: Number, 
		required: true,
		set: v => new Int32(v)
	},
	savedEvents: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Event',
		required: true
	}],
	orgs: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Org',
		required: true
	}],
	interests: [{type: String, required: true}]
}, {
	timestamps: true,
	versionKey: false,
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;