const mongoose = require('mongoose');

const CommandSchema = new mongoose.Schema({
    name: String,
    response: { type: String, default: '' },
    permission: { Broadcaster: { type: Number, default: 1 }, Moderators: { type: Number, default: 1 }, Everyone: { type: Number, default: 1 } },
    cooldown: { type: Number, default: 3000 },
    onCooldown: { type: Boolean, default: false },
    alias: [String]
});

mongoose.model('Command', CommandSchema);
module.exports = mongoose.model('Command');