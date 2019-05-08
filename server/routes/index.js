var express = require('express');
var router = express.Router();
var authService = require('../services/auth.service');
var userService = require('../services/user.service');
var issueService = require('../services/issue.service');

/******************************************************
	ROUTEs which can be accessed without Access Token 
******************************************************/
router.post('/login', authService.login);
router.post('/signup', authService.register);

/*
    Below ROUTEs which can not be accessed without Access Token 
*/

/*********************************** 
 *  User Routes
 ************************************/

router.get('/v1/me', userService.currentUser);

/*********************************** 
 *  issue Routes
 ************************************/

router.post('/v1/issue', issueService.create);
router.get('/v1/issues', issueService.getall);
router.put('/v1/issue/:id', issueService.update);
router.get('/v1/issue/:id', issueService.getOne);
router.delete('/v1/issue/:id', issueService.delete);
router.post('/v1/issue/comment/:issue_id', issueService.addComment);
router.put('/v1/issue/assign/:issue_id', issueService.addAssignee);
router.delete('/v1/issue/assign/:issue_id', issueService.removeAssignee);
router.put('/v1/issue/watcher/:issue_id', issueService.addWatcher);
router.delete('/v1/issue/watcher/:issue_id', issueService.removeWatcher);
router.get('/v1/issue/assignees/:issue_id', issueService.allAssignee);
router.get('/v1/issue/watchers/:issue_id', issueService.allWatcher);
router.get('/v1/issue/comments/:issue_id', issueService.getComments);
router.delete('/v1/issue/comment/:comment_id', issueService.removeComment);
router.get('/v1/users', userService.getallUsers);
router.post('/v1/notifications', issueService.addNotification);
router.post('/v1/send-notification', issueService.sendNotifications);
router.post('/v1/unsubscribe', issueService.unsubscribe);

module.exports = router;