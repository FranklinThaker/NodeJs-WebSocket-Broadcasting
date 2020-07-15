const mongoose = require('mongoose');

const Rooms = mongoose.Schema({
  roomName: { type: String, default: '' },
  userId: { type: mongoose.Schema.ObjectId, ref: 'users', default: null }, // who created the room
}, {
  timestamps: true,
});


module.exports = mongoose.model('rooms', Rooms);
