const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
    name: { type: String },
    isOn: { type: Boolean, default: false }
});

mongoose.model('Status', StatusSchema);
module.exports = mongoose.model('Status');