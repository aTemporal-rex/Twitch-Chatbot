const mongoose = require('mongoose');

const PokemonSchema = new mongoose.Schema({
    trainer: String,
    pokemon: [String],
    trainerId: String
});

mongoose.model('Pokemon', PokemonSchema);
module.exports = mongoose.model('Pokemon');