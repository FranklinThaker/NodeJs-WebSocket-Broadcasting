const mongoose = require('mongoose');

const Users = mongoose.Schema({
  name: { type: String, default: '' },
  emailAddress: { type: String, default: '', unique: true },
  password: { type: String, default: '' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('users', Users);
