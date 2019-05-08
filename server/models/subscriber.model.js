// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var schema = mongoose.Schema({
    sub_data: Object,
    issue_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Issue',
    },
    user_id: {
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
module.exports = mongoose.model('Subscriber', schema);