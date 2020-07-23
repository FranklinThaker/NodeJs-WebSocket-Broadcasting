const express = require('express');
const user = require('../user/user.controller');
const { authentication } = require('../../middleware/middleware');

const router = express.Router();

router.post('/signup',
  user.signup);

router.post('/signin',
  user.login);

router.post('/forgotPassword',
  user.forgotPassword);

router.post('/resetPassword',
  authentication,
  user.resetPassword);

router.post('/addFriend',
  authentication,
  user.addFriend);

router.post('/acceptRequest',
  authentication,
  user.AcceptFrdRequest);

router.get('/listSentFrdRequest',
  authentication,
  user.ListSentFrdRequests);

router.get('/listReceivedRequests',
  authentication,
  user.ListReceiveFrdRequests);

router.get('/friends',
  authentication,
  user.friends);

router.post('/createRoom',
  authentication,
  user.createRoom);

router.get('/listRoomByUser',
  authentication,
  user.listRoomByUser);

router.post('/addUsersToRoom',
  authentication,
  user.addUsersToRoom);

router.get('/listOFUsersInTheRoom',
  authentication,
  user.listOFUsersInTheRoom);

router.get('/listOfRoomsAvailableToUsers',
  authentication,
  user.listOfRoomsAvailableToUsers);

router.get('/getMessagesInRoom',
  authentication,
  user.getMessagesInRoom);


module.exports = router;
