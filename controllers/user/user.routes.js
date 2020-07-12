const express = require('express');
const user = require('../user/user.controller');
const { authentication } = require('../../middleware/middleware');

const router = express.Router();

router.post('/signup',
  user.signup);

router.post('/signin',
  user.login);

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

module.exports = router;
