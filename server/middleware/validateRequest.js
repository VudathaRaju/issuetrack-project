var jwt = require('jwt-simple');
var validateUser = require('../services/auth.service').validateUser;

module.exports = function (req, res, next) {
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

    if (token) {
        try {
            var decoded = jwt.decode(token, require('../config').secret());

            if (decoded.exp <= Date.now()) {
                res.status(400).json({
                    "error": true,
                    "message": "Token Expired",
                    "status": 400,
                    "data": null
                });
                return;
            }

            // Authorize the user to see if s/he can access our resources

            //validateUser(decoded.user_id, _handle);
            validateUser(decoded.user_id, _handle);

            function _handle(dbUser) {
                if (dbUser) {

                    if ((req.url.indexOf('admin') >= 0 && dbUser.role == 'administrator') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/v1/') >= 0)) {
                        req.currentUser = dbUser;

                        next(); // To move to next middleware
                    } else {
                        res.status(403).json({
                            "error": true,
                            "message": "Not Authorized",
                            "status": 403,
                            "data": null
                        });
                        return;
                    }
                } else {
                    // No user with this name exists, respond back with a 401

                    res.status(401).json({
                        "error": true,
                        "message": "Invalid User",
                        "status": 401,
                        "data": null
                    });
                    return;
                }
            }
        } catch (err) {
            res.status(500).json({
                "error": true,
                "message": err.message,
                "status": 500,
                "data": null
            });
        }
    } else {
        res.status(401).json({
            "error": true,
            "message": "Invalid Token",
            "status": 401,
            "data": null
        });
        return;
    }
};