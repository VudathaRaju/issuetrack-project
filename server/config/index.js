/*
    Configuration File
    Setting up Environment variables...
*/

module.exports = {
    /* Database configuration */
    'database': 'mongodb://localhost:27017/issuetrackingtooldb',

    secret: function () {
        return 'b@tch.key';
    }
};
