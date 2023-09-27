'use strict';

const base64 = require('base-64');
const { users } = require('../models/index.js');

async function basicAuth (req, res, next) {
  //console.log('Auth header:', req.headers.authorization);
  if (!req.headers.authorization) { 
    next('Invalid Auth Header');
  }

  let encodedString = req.headers.authorization.split(' ')[1];
  let decodedString = base64.decode(encodedString);
  let [username, pass] = decodedString.split(':');
  console.log('basic.js pass:',pass);
  try {
    let validUser = await users.authenticateBasic(username, pass)
    //console.log(validUser);

    if (validUser) {
      req.user = validUser;
      next();
    } else {
      next('Invalid Auth Attempt');
    }
  } catch (e) {
    console.error(e);
    next('Error logging in');
  }

}

module.exports = basicAuth;