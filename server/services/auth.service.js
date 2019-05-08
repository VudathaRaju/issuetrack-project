var jwt = require('jwt-simple');
var validator = require("email-validator");

var configVar = require('../config');
var User = require('../models/user.model');

var auth = {
    register: function (req, res) {
        //console.log("********************");
        var firstname = req.body.firstname || "";
        var lastname = req.body.lastname || "";
        var email = req.body.email || "";
        var username = req.body.username || "";
        var password = req.body.password || "";

        if (email == "" || username == "" || password == "" || email.trim().length == 0 || username.trim().length == 0 || password.trim().length == 0) {
            res.status(400).json({
                "error": true,
                "message": "email, username or password was not provided",
                "status": 400,
                "data": null
            });
            return;
        }

        if (!validator.validate(email)) {

            res.status(400).json({
                "error": true,
                "message": "provided email is not valid",
                "status": 400,
                "data": null
            });
            return;
        }

        auth.userExist(email, _handle);

        function _handle(err, user) {
            if (err) {
                res.status(500).json({
                    "error": true,
                    "message": "Something went wrong at server",
                    "status": 500,
                    "data": null
                });
                return;
            }

            if (user) {
                res.status(409).json({
                    "error": true,
                    "message": "User already exist with this email",
                    "status": 409,
                    "data": null
                });
                return;
            }

            var userCollection = new User({
                'email': email,
                'password': new User().generateHash(password),
                'firstname': firstname,
                'lastname': lastname,
                'username': username,
            })

            userCollection.save(_saveUser);

            function _saveUser(err, user) {
                if (err && err.code == 11000) {
                    res.status(500).json({
                        "error": true,
                        "message": "Duplicate username",
                        "status": 500,
                        "data": null
                    });
                    return;
                }
                if (err) {
                    res.status(500).json({
                        "error": true,
                        "message": "Something went wrong at server",
                        "status": 500,
                        "data": null
                    });
                    return;
                }

                res.json(genToken(user));
            }
        }
    },

    login: function (req, res) {
        var username = req.body.username || '';
        var password = req.body.password || '';

        if (username == '') {
            res.status(400);
            res.json({
                "error": true,
                "message": "Invalid user",
                "status": 400,
                "data": null
            });
            return;
        }

        if (password == '') {
            res.status(400).json({
                "error": true,
                "message": "Please Enter Your Password",
                "status": 400,
                "data": null
            });
            return;
        }

        _validate();

        function _validate() {
            // Fire a query to your DB and check if the credentials are valid
            auth.validate(username, password, function (dbUserObj) {

                if (!dbUserObj) { // If authentication fails, we send a 401 back
                    res.status(401).json({
                        "error": true,
                        "message": "Invalid credentials",
                        "status": 401,
                        "data": null
                    });
                    return;
                }

                if (dbUserObj.status && dbUserObj.status != 'Active') {
                    res.status(401).json({
                        "error": true,
                        "message": "Your account is Inactive. Please contact administrator.",
                        "status": 401,
                        "data": null
                    });
                    return;
                }
                res.json(genToken(dbUserObj));
            });
        }
    },

    validate: function (email, password, done) {
        User.findOne({
            $or: [{
                "email": {
                    "$regex": "^" + email.toLowerCase() + "\\b",
                    "$options": "i"
                }
            }, {
                "username": {
                    "$regex": "^" + email.toLowerCase() + "\\b",
                    "$options": "i"
                }
            }]
        }, _handleCallback);

        function _handleCallback(err, doc) {
            if (typeof doc == 'undefined' || doc == null) return done(null);

            var result = doc.validPassword(password);

            return result ? done(doc) : done(null);
        }
    },

    validateUser: function (userId, done) {
        User.findOne({
            _id: userId
        }, _handleUserDb);

        function _handleUserDb(err, doc) {
            if (err) {
                return done(null);
            }

            if (!doc) {
                return done(null);
            }

            if (typeof doc == 'undefined') return done(null);

            return done(doc);
        } //handleDB
    },

    userExist: function (email, callback) {
        User.findOne({
            'email': email
        }, callback);
    },

    removeUser: function (email, callback) {
        User.remove({
            'email': email
        }, callback);
    }
}

// private method
function genToken(user) {
    var expires = expiresIn(7); // 7 days
    var token = jwt.encode({
        exp: expires,
        user_id: user._id,
        role: user.type,
        firstname: user.firstname
    }, configVar.secret());

    return {
        token: token,
        expires: expires,
        user_id: user._id
    };
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = auth;