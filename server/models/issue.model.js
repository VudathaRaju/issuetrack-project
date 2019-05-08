// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var issueSchema = mongoose.Schema({
    status: {
        type: String,
        trim: true,
        default: 'backlog'
    },
    title: {
        type: String,
        trim: true
    },
    attachment: String,
    description: String,
    assignee: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }],
    watcher: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }],
    reporter: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    created_on: {
        type: Date,
        default: Date.now
    },
    updated_on: {
        type: Date,
        default: Date.now
    },
}, {
    usePushEach: true
});

issueSchema.pre('save', function (next) {
    this.updated_on = Date.now();
    next();
});

// create the model for issue and expose it to our app
module.exports = mongoose.model('Issue', issueSchema);