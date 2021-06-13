require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@clustersol.kgnfz.mongodb.net/${process.env.MONGODB_DATABASE_NAME}?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});