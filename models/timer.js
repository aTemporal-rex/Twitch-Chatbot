const mongoose = require('mongoose');

const TimerSchema = new mongoose.Schema({
    name: String,
    message: { type: String, default: '' },
    interval: { type: Number, default: 300000 },
    isOn: { type: Boolean, default: false }
});

mongoose.model('Timer', TimerSchema);
module.exports = mongoose.model('Timer');