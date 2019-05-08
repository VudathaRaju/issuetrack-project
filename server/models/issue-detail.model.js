// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var schema = mongoose.Schema({
    comment: String,
    issue_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Issue',
    },
    date: {
        type: Date,
        default: Date.now
    },
    commentor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
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

schema.pre('save', function (next) {
    this.updated_on = Date.now();
    next();
});

// create the model for issue and expose it to our app
module.exports = mongoose.model('IssueDetail', schema);