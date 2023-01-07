require('dotenv').config();

const mongoose = require('mongoose');

console.log("mongoose loading?")
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}); console.log("Loading...")
mongoose.connection.on('connected', () => console.log('Connected'));
mongoose.connection.on('error', () => console.log('Connection failed with - ',err));