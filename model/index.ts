require('dotenv').config();
const mongoose = require('mongoose');
const Agent = require('./agent');

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
};

const models = { Agent };

module.exports = {
  connectDb,
  models,
};
