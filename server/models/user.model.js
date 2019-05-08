// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    firstname : {
        type: String,
        lowercase: true,
        trim: true
    },
    lastname: {
        type: String,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true
    },
    password: {
        type: String,
        require: true,
        trim: true
    },
    name: String,
    username: {
        type: String,
        require: true,
        trim: true
    },
    status: {
        type: [{
            type: String,
            enum: ['Active', 'Inactive', 'Suspended', 'Invited', 'Joined']
        }],
        default: ['Active'],
    },
    account_activated: {
        type: Boolean,
        default: false
    },
    created_on: {
        type: Date,
        default: Date.now
    },
    updated_on: {
        type: Date,
        default: Date.now
    },
	role: {
        type: String,
        require: true,
        trim: true,
		default: 'user'
    }
}, {
        usePushEach: true
    });

userSchema.pre('save', function (next) {
    this.updated_on = Date.now();
    next();
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
