const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const server = require('./api/server');

const port = parseInt(process.env.PORT || '7000');

server.listen(port, () => {
    console.log(`alive on *:${port}`);
  });
