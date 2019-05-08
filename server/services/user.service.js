var userService = [];
var UserModel = require('../models/user.model');

userService.currentUser = function (req, res, next) {
    console.log('req.currentUser:: ');
    res.json(req.currentUser);
}

userService.getallUsers = (req, res) => {
    UserModel.find({}, (err, docs) => {
        if (err) {
            return res.status(500).json({
                error: true,
                message: err.message || 'Something went wrong while getting users',
                status: 500,
                data: null
            })
        }
        return res.status(200).json({
            error: false,
            message: "get all users data",
            status: "200",
            data: docs
        });
    })
}

module.exports = userService;