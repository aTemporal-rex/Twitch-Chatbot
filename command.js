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

// // commandList.animeAll = "!anime";
// // commandList.mangaAll = "!manga";
// // commandList.animeScore = /^!anime[0-9]{1,2}?$/;
// // commandList.mangaScore = /^!manga[0-9]{1,2}?$/;

// // console.log(commandList.animeAll);

// // Maybe use an array of values from 0-99 instead of regex