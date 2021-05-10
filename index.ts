const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const server = require('./api/server');
const { connectDb } = require('./model/index');

const port = parseInt(process.env.PORT || '7000');

connectDb()
  .then(async () => {
    try {
      server.listen(port, () =>
        console.log(`===== Server running on port ${port} =====`)
      );
    } catch (error) {
      console.error(error);
    }
  })
  .catch((error: any) => console.error(error));
