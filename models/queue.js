const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
    name: String,
    position: Number
});

mongoose.model('Queue', QueueSchema);
module.exports = mongoose.model('Queue');