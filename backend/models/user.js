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
    // Changed these arrays to allow empty arrays on registration
    savedEvents: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        }],
        default: [],
        required: true
    },
    orgs: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Org'
        }],
        default: [],
        required: true
    },
    interests: [{type: String, required: true}]
}, {
    timestamps: true,
    versionKey: false,
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;