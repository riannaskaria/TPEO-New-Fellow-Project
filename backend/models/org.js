const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
	name: {type: String, required: true},
}, {
	timestamps: true,
	versionKey: false,
});

const Org = mongoose.model('Org', orgSchema, 'orgs');

module.exports = Org;