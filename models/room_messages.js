const mongoose = require('mongoose');

const RoomMessages = mongoose.Schema({
  roomId: { type: mongoose.Schema.ObjectId, ref: 'rooms', default: null },
  messages: { type: Array, default: [] },
},
{
  timestamps: true,
});

module.exports = mongoose.model('roomMessages', RoomMessages);
