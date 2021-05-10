const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const agentScheme = mongoose.model('Agent', agentSchema);
module.exports = agentScheme;
