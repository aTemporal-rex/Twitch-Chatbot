const mongoose = require('mongoose');

const PokemonSchema = new mongoose.Schema({
    trainer: String,
    pokemon: [{
        _id: false,
        name: { type: String, default: null },
        wins: { type: Number, default: 0 }
    }],
    selectedPokemon: { 
        name: {type: String, default: null },
        wins: {type: Number, default: 0 }
    },
    trainerId: String
});

mongoose.model('Pokemon', PokemonSchema);
module.exports = mongoose.model('Pokemon');