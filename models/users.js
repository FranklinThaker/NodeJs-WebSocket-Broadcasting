const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const Users = mongoose.Schema({
  name: { type: String, default: '' },
  emailAddress: { type: String, default: '', unique: true },
  password: { type: String, default: '' },
  friends: [{ type: String, default: '' }],
  requests: [{ type: String, default: '' }],
}, {
  timestamps: true,
});

Users.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
  next();
});

Users.methods.comparePassword = function (passw, cb) {
  bcrypt.compare(passw, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('users', Users);
