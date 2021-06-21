const mongoose = require('mongoose');

const CommandSchema = new mongoose.Schema({
    name: String,
    response: { type: String, default: '' },
    permission: {type: String, default: 'Everyone' },
    cooldown: { type: Number, default: 3000 },
    alias: [String]
});

mongoose.model('Command', CommandSchema);
module.exports = mongoose.model('Command');