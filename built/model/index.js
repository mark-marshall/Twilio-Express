"use strict";
require('dotenv').config();
const mongoose = require('mongoose');
const AgentModal = require('./agent');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
const connectDb = () => {
    return mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
};
const models = { AgentModal };
module.exports = {
    connectDb,
    models,
};
