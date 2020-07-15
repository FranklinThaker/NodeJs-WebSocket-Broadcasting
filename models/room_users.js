const mongoose = require('mongoose');

const RoomUsers = mongoose.Schema({
  roomId: { type: mongoose.Schema.ObjectId, ref: 'rooms', default: null },
  userId: { type: mongoose.Schema.ObjectId, ref: 'users', default: null }, // who is added to the room
}, {
  timestamps: true,
});


module.exports = mongoose.model('roomUsers', RoomUsers);
