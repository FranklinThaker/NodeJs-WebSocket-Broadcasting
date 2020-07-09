const mongoose = require('mongoose');

const Sockets = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: 'users', default: null },
    socketId: [{ type: String, default: '' }],
    emailAddress: { type: String, default: '' },
  }, {
    timestamps: true,
  },
);

module.exports = mongoose.model('sockets', Sockets);
