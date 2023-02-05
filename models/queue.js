const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    position: Number
});

mongoose.model('Queue', QueueSchema);
module.exports = mongoose.model('Queue');