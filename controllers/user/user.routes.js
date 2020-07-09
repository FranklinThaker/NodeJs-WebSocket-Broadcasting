const express = require('express');
const user = require('../user/user.controller');

const router = express.Router();

router.post('/signup',
  user.signup);

router.post('/signin',
  user.login);


module.exports = router;
