'use strict';

//seems to need .env
require('dotenv').config();
const server = require('./src/server.js');
 

// Start up DB Server
const { db } = require('./src/auth/models/index.js');
db.sync({ logging: true })
  .then(() => {

    // Start the web server
    server.startup(process.env.PORT);
  });

