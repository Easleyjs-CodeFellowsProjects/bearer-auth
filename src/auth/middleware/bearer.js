'use strict';

const { users } = require('../models/index.js');

module.exports = async (req, res, next) => {

  try {

    if (!req.headers.authorization) { next('Invalid Login') }
    //which part of jwt is token, which part is username
    const token = req.headers.authorization.split(' ').pop();

    const validUser = await users.authenticateToken(token);
    //console.log("Valid User:",validUser.dataValues);
    req.user = validUser;
    req.token = validUser.token;
    next();
  } catch (e) {
    console.error(e);
    res.status(403).send('Invalid Login');
  }
}
