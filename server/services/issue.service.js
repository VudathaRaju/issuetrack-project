var multer = require('multer');
var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
const webpush = require('web-push');
var IssueModel = require('../models/issue.model');
var IssueDetailModel = require('../models/issue-detail.model');
var SubscriberModel = require('../models/subscriber.model');
var UserModel = require('../models/user.model');
var service = {};
var folder = 'issues';

var createFolderIfNotExist = function (folderNameWithPath) {
    !fs.existsSync(folderNameWithPath) && fs.mkdirSync(folder);
}

createFolderIfNotExist(__dirname + '/../' + folder);

// Basic Setting for Multer to store screenshots
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        var dir = __dirname + '/../' + folder + '/' + req.currentUser._id;
        !fs.existsSync(dir) && fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, guid() + '-' + Date.now() + file.originalname);
    }
})
/*
    creating Issue
*/

service.create = (req, res) => {
    var upload = multer({
        storage: storage
    }).single('file');

    // Save file to disk using Multer
    upload(req, res, (err) => {
        req.body.reporter = req.currentUser._id;
        if (!req.body.description || req.body.description.trim().length == 0) {
            res.status(400).json({
                error: true,
                message: "description was not provided",
                status: 400,
                data: null
            });
            return;
        }
        if (!req.body.title || req.body.title.trim().length == 0) {
            res.status(400).json({
                error: true,
                message: "title was not provided",
                status: 400,
                data: null
            });
            return;
        }

        if (err) {
            // Error got during saving file to disk.
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            })
        }
        if (req.file)
            req.body.attachment = folder + '/' + req.currentUser._id + '/' + req.file.filename;

        new IssueModel(req.body).save((err, savedoc) => {
            if (err) {
                return res.status(500).json({
                    error: true,
                    message: err.message || 'Error occurred while creating issue',
                    status: 400,
                    data: null
                })
            }
            return res.status(200).json({
                error: false,
                message: "issue created successfully",
                status: "200",
                data: { savedDoc: savedoc }
            })
        })
    });
}
/*
    Get all issue
*/
service.getall = (req, res) => {
    IssueModel.aggregate([{
        "$match": {}
    },
    {
        $lookup: {
            from: 'users',
            localField: 'reporter',
            foreignField: '_id',
            as: 'reporter'
        }
    }
    ]).sort({
        _id: -1
    }).exec(_handler);

    function _handler(err, docs) {
        if (err) {
            return res.status(500).json({
                error: true,
                message: err.message || 'Something went wrong while getting issue details',
                status: 500,
                data: null
            })
        }

        var tmpArr = [];
        docs.forEach(doc => {
            // if (doc.reporter[0]._id.toString() == req.currentUser._id.toString()
            // || doc.assignee.map(x => x.toString())``.indexOf(req.currentUser._id.toString()) > -1
            // || doc.watcher.map(x => x.toString()).indexOf(req.currentUser._id.toString()) > -1) {

            var q = req.query.q || '';
            q = q.toUpperCase();
            if (q != '' && (doc.title.toUpperCase().indexOf(q) > -1) || doc.description.toUpperCase().indexOf(q) > -1) {
                tmpArr.push(doc);
            }

            if (q = '') tmpArr.push(doc);
            // }
        })

        return res.status(200).json({
            error: false,
            message: "get all issues data",
            status: "200",
            data: tmpArr
        });
    }
}

service.getOne = (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({
            error: true,
            message: "issue id was not provided",
            status: 400,
            data: null
        });
    }
    IssueModel.find({
        _id: req.params.id
    }, function (err, resIssue) {
        if (err) {
            return res.status(500).json({
                error: true,
                message: err.message || 'Something went wrong while getting issue details',
                status: 500,
                data: null
            })
        }

        var accessType = 'read';
        if (resIssue[0].reporter.toString() == req.currentUser._id.toString()
            || resIssue[0].assignee.map(x => x.toString()).indexOf(req.currentUser._id.toString()) > -1) {
            accessType = 'edit';
        }

        return res.status(200).json({
            error: false,
            message: "get one issue data",
            status: "200",
            data: resIssue,
            accessType: accessType
        });
    })
}

/*
   Update Issue
*/
service.update = (req, res) => {
    if (!req.params.id || req.params.id.trim().length == 0) {
        return res.status(400).json({
            error: true,
            message: "issue id was not provided",
            status: 400,
            data: null
        });
    }
    var issueData = req.body;
    IssueModel.findByIdAndUpdate(req.params.id, issueData, {
        new: true
    }, function (err, issuemodel) {

        if (err) {
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            });
        }
        res.status(200).json({
            "error": false,
            "message": "Issue Updated Successfully",
            "status": 200,
            "data": issuemodel
        });
    })
}

service.delete = (req, res) => {
    if (!req.params.id || req.params.id.trim().length == 0) {
        return res.status(400).json({
            error: true,
            message: "issue id was not provided",
            status: 400,
            data: null
        });
    }

    IssueModel.remove({
        _id: req.params.id
    }, function (err, docs) {
        if (err) {
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            });
        }
        res.json({
            "error": false,
            "message": "Issue Deleted Successfully",
            "status": 200,
            "data": []
        })
    })
}

service.addComment = (req, res) => {
    var issue_id = req.params.issue_id;
    if (!issue_id) return res.status(400).json({
        error: true,
        message: "issue_id was not provided",
        status: 400,
        data: null
    });

    var comment = req.body.comment;
    if (!comment) return res.status(400).json({
        error: true,
        message: "comment was not provided",
        status: 400,
        data: null
    });

    new IssueDetailModel({
        comment: req.body.comment,
        issue_id: req.params.issue_id,
        commentor: req.currentUser._id
    }).save(err => {
        if (err) {
            // Error got during saving file to disk.
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            })
        }

        res.status(200).json({
            "error": false,
            "message": "Comment added Successfully",
            "status": 200,
            "data": []
        });
    })
};

service.addAssignee = (req, res) => {
    var issue_id = req.params.issue_id;
    var assignee = req.body.assignee;
    if (!issue_id) return res.status(400).json({
        error: true,
        message: "issue_id was not provided",
        status: 400,
        data: null
    });
    if (!assignee) return res.status(400).json({
        error: true,
        message: "assignee was not provided",
        status: 400,
        data: null
    });

    IssueModel.findOne({
        _id: issue_id
    }, (err, doc) => {
        if (err) {
            // Error got during saving file to disk.
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            })
        }

        doc.assignee.push(assignee);
        doc.save(err => {
            if (err) {
                // Error got during saving file to disk.
                return res.status(400).json({
                    error: true,
                    message: err.message || 'invalid request',
                    status: 400,
                    data: null
                })
            }

            res.status(200).json({
                "error": false,
                "message": "Assignee added Successfully",
                "status": 200,
                "data": []
            });
        })
    })
}

service.removeAssignee = (req, res) => {
    var issue_id = req.params.issue_id;
    var assignee = req.query.assignee;
    if (!issue_id) return res.status(400).json({
        error: true,
        message: "issue_id was not provided",
        status: 400,
        data: null
    });
    if (!assignee) return res.status(400).json({
        error: true,
        message: "assignee was not provided",
        status: 400,
        data: null
    });

    IssueModel.findOne({
        _id: issue_id
    }, (err, doc) => {
        if (err) {
            // Error got during saving file to disk.
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            })
        }

        if (doc.assignee.indexOf(assignee)) {
            doc.assignee.splice(doc.assignee.indexOf(assignee), 1);
        }
        doc.save(err => {
            if (err) {
                // Error got during saving file to disk.
                return res.status(400).json({
                    error: true,
                    message: err.message || 'invalid request',
                    status: 400,
                    data: null
                })
            }

            res.status(200).json({
                "error": false,
                "message": "Assignee removed Successfully",
                "status": 200,
                "data": []
            });
        })
    })
}

service.addWatcher = (req, res) => {
    var issue_id = req.params.issue_id;
    var watcher = req.body.watcher;
    if (!issue_id) return res.status(400).json({
        error: true,
        message: "issue_id was not provided",
        status: 400,
        data: null
    });
    if (!watcher) return res.status(400).json({
        error: true,
        message: "watcher was not provided",
        status: 400,
        data: null
    });

    IssueModel.findOne({
        _id: issue_id
    }, (err, doc) => {
        if (err) {
            // Error got during saving file to disk.
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            })
        }

        doc.watcher.push(watcher);
        doc.save(err => {
            if (err) {
                // Error got during saving file to disk.
                return res.status(400).json({
                    error: true,
                    message: err.message || 'invalid request',
                    status: 400,
                    data: null
                })
            }

            res.status(200).json({
                "error": false,
                "message": "Watcher added Successfully",
                "status": 200,
                "data": []
            });
        })
    })
}

service.removeWatcher = (req, res) => {
    var issue_id = req.params.issue_id;
    var watcher = req.query.watcher;
    if (!issue_id) return res.status(400).json({
        error: true,
        message: "issue_id was not provided",
        status: 400,
        data: null
    });
    if (!watcher) return res.status(400).json({
        error: true,
        message: "watcher was not provided",
        status: 400,
        data: null
    });

    IssueModel.findOne({
        _id: issue_id
    }, (err, doc) => {
        if (err) {
            // Error got during saving file to disk.
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            })
        }

        if (doc.watcher.indexOf(watcher)) {
            doc.watcher.splice(doc.watcher.indexOf(watcher), 1);
        }
        doc.save(err => {
            if (err) {
                // Error got during saving file to disk.
                return res.status(400).json({
                    error: true,
                    message: err.message || 'invalid request',
                    status: 400,
                    data: null
                })
            }

            res.status(200).json({
                "error": false,
                "message": "Watcher removed Successfully",
                "status": 200,
                "data": []
            });
        })
    })
}

service.allAssignee = (req, res) => {
    var issue_id = req.params.issue_id;
    if (!issue_id) return res.status(400).json({
        error: true,
        message: "issue_id was not provided",
        status: 400,
        data: null
    });

    var query = {
        _id: mongoose.Types.ObjectId(issue_id)
    }

    IssueModel.findOne({ _id: issue_id }, (err, issue) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            })
        }

        UserModel.find({}, (err, users) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: err.message || 'invalid request',
                    status: 400,
                    data: null
                })
            }

            var assignees = issue.assignee;
            var tmpAssignees = [];
            assignees.forEach(as => {
                users.forEach(user => {
                    if (as.toString() == user._id.toString()) {
                        tmpAssignees.push(user);
                    }
                })
            })
            res.status(200).json({
                "error": false,
                "message": "Assignee list",
                "status": 200,
                data: tmpAssignees
            });
        })
    })

    // IssueModel.aggregate({
    //     "$match": query
    // },
    //     {
    //         $lookup: {
    //             from: 'users',
    //             localField: 'assignee',
    //             foreignField: '_id',
    //             as: 'assignees'
    //         }
    //     }
    // ).sort({
    //     _id: -1
    // }).exec(_handler);

    // function _handler(err, docs) {

    // }
}

service.allWatcher = (req, res) => {
    var issue_id = req.params.issue_id;
    if (!issue_id) return res.status(400).json({
        error: true,
        message: "issue_id was not provided",
        status: 400,
        data: null
    });

    var query = {
        _id: mongoose.Types.ObjectId(issue_id)
    }

    IssueModel.findOne({ _id: issue_id }, (err, issue) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            })
        }

        UserModel.find({}, (err, users) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: err.message || 'invalid request',
                    status: 400,
                    data: null
                })
            }

            var watchers = issue.watcher;
            var tmpWatchers = [];
            watchers.forEach(as => {
                users.forEach(user => {
                    if (as.toString() == user._id.toString()) {
                        tmpWatchers.push(user);
                    }
                })
            })
            res.status(200).json({
                "error": false,
                "message": "Assignee list",
                "status": 200,
                data: tmpWatchers
            });
        })
    })

    // IssueModel.aggregate([{
    //     "$match": query
    // },
    // {
    //     $lookup: {
    //         from: 'users',
    //         localField: 'watcher',
    //         foreignField: '_id',
    //         as: 'watchers'
    //     }
    // }
    // ]).sort({
    //     _id: -1
    // }).exec(_handler);

    // function _handler(err, docs) {
    //     if (err) {
    //         return res.status(400).json({
    //             error: true,
    //             message: err.message || 'invalid request',
    //             status: 400,
    //             data: null
    //         })
    //     }
    //     res.status(200).json({
    //         "error": false,
    //         "message": "Watcher list",
    //         "status": 200,
    //         "data": docs[0].watchers
    //     });
    // }
}

service.getComments = (req, res) => {
    var issue_id = req.params.issue_id;
    if (!issue_id) return res.status(400).json({
        error: true,
        message: "issue_id was not provided",
        status: 400,
        data: null
    });

    var query = {
        issue_id: mongoose.Types.ObjectId(issue_id)
    }

    IssueDetailModel.aggregate([{
        "$match": query
    },
    {
        $lookup: {
            from: 'users',
            localField: 'commentor',
            foreignField: '_id',
            as: 'commentor'
        }
    }
    ]).sort({
        _id: -1
    }).exec(_handler);

    function _handler(err, docs) {
        if (err) {
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            })
        }
        res.status(200).json({
            "error": false,
            "message": "Comment list",
            "status": 200,
            "data": docs
        });
    }
}

service.removeComment = (req, res) => {
    var comment_id = req.params.comment_id;
    if (!comment_id) return res.status(400).json({
        error: true,
        message: "comment_id was not provided",
        status: 400,
        data: null
    });
    IssueDetailModel.remove({
        _id: comment_id
    }, (err) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            })
        }
        res.status(200).json({
            "error": false,
            "message": "Comment removed successfully",
            "status": 200,
            "data": []
        });
    })
}

service.addNotification = (req, res) => {
    if (!req.body.issue_id) {
        return res.status(400).json({
            error: true,
            message: "issue_id was not provided",
            status: 400,
            data: null
        });
    }
    SubscriberModel.findOne({ 'issue_id': req.body.issue_id }, (err, doc) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            })
        }

        if (!doc) {
            new SubscriberModel(req.body)
                .save(err => {
                    if (err) {
                        return res.status(400).json({
                            error: true,
                            message: err.message || 'invalid request',
                            status: 400,
                            data: null
                        })
                    }
                    res.status(200).json({
                        "error": false,
                        "message": "Subscriber added successfully",
                        "status": 200,
                        "data": []
                    });
                })
        } else {
            if (doc.sub_data.endpoint != req.body.sub_data.endpoint) {
                new SubscriberModel(req.body)
                    .save(err => {
                        if (err) {
                            return res.status(400).json({
                                error: true,
                                message: err.message || 'invalid request',
                                status: 400,
                                data: null
                            })
                        }
                        res.status(200).json({
                            "error": false,
                            "message": "Subscriber added successfully",
                            "status": 200,
                            "data": []
                        });
                    })
            } else {
                res.status(200).json({
                    "error": false,
                    "message": "Subscriber already added",
                    "status": 200,
                    "data": []
                });
            }
        }
    })
}

service.sendNotifications = (req, res) => {
    if (!req.body.body) {
        return res.status(400).json({
            error: true,
            message: "body was not provided",
            status: 400,
            data: null
        });
    }
    if (!req.body.url) {
        return res.status(400).json({
            error: true,
            message: "url was not provided",
            status: 400,
            data: null
        });
    }
    if (!req.body.title) {
        return res.status(400).json({
            error: true,
            message: "title was not provided",
            status: 400,
            data: null
        });
    }
    if (!req.body.issue_id) {
        return res.status(400).json({
            error: true,
            message: "issue_id was not provided",
            status: 400,
            data: null
        });
    }
    var data = req.body;
    // sample notification payload
    const notificationPayload = {
        "notification": {
            "title": data.title,
            "body": data.body,
            "icon": "assets/main-page-logo-small-hat.png",
            "vibrate": [100, 50, 100],
            "data": {
                "dateOfArrival": Date.now(),
                "primaryKey": 1,
                "url": data.url
            },
            "actions": [{
                "action": "open_url",
                "title": "Go to the site"
            }]
        }
    };

    SubscriberModel.find({ issue_id: data.issue_id }, (err, docs) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            })
        }

        Promise.all(docs.map(doc => webpush.sendNotification(doc.sub_data, JSON.stringify(notificationPayload))))
            .then(() => res.status(200).json({
                "error": false,
                "message": "Notifications sent successfully",
                "status": 200,
                "data": []
            }))
            .catch(err => {
                console.error("Error sending notification, reason: ", err);
                return res.status(400).json({
                    error: true,
                    message: err.message || 'invalid request',
                    status: 400,
                    data: null
                })
            });
    })
}

service.unsubscribe = (req, res) => {
    var user_id = req.body.user_id;
    if (!user_id) {
        return res.status(400).json({
            error: true,
            message: "user_id was not provided",
            status: 400,
            data: null
        });
    }

    SubscriberModel.remove({ user_id: user_id }, err => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: err.message || 'invalid request',
                status: 400,
                data: null
            })
        }
        res.status(200).json({
            "error": false,
            "message": "Subscriber removed successfully",
            "status": 200,
            "data": []
        })
    })
}

module.exports = service;

// Fn to get Unique GUID on each call
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}