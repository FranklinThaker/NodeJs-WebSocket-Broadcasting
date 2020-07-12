const mongoose = require('mongoose');

const Friends = mongoose.Schema({
  fromSender: { type: mongoose.Schema.ObjectId, ref: 'users', default: null },
  toRecipient: { type: mongoose.Schema.ObjectId, ref: 'users', default: null },
  status: { type: Number, default: 0 }, // 0 pending 1 accept request 2 you
}, {
  timestamps: true,
});


module.exports = mongoose.model('friends', Friends);
