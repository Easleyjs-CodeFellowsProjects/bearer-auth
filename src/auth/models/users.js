'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "TEST_SECRET";

const userSchema = (sequelize, DataTypes) => {
  const jwtOptions = {
    expiresIn: '1h',        // Token expiration time
    issuer: 'easleyjs',     // Issuer
    audience: 'users',     // Audience
  };
  const model = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING,
                allowNull: false, 
    },
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        // token expires in 2 minutes. lasts up to 7 days.
        return jwt.sign({ username: this.username }, JWT_SECRET, jwtOptions);
      }
    }
  });

  model.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
  });

  // Basic AUTH: Validating strings (username, password) 
  model.authenticateBasic = async function (username, password) {
    console.log('authenticateBasic password:',password);
    let user = await this.findOne({ where: { username: username }, logging: (sql, queryObject) => {
      console.log(queryObject) //queryObject
    }, });

    let valid = await bcrypt.compare(password, user.password)
    if (valid) { 
      return user 
    } else {
      throw new Error('Invalid User Credentials');
    }
  }

  // Bearer AUTH: Validating a token
  model.authenticateToken = async function (token) {
    try {
      const parsedToken = jwt.verify(token, JWT_SECRET);
      //console.log('parsedToken: ',parsedToken.username);
      const user = await this.findOne({ where: { username: parsedToken.username }});
      if (user) { 
        return user; 
      }
      throw new Error("User Not Found");
    } catch (e) {
      throw new Error(e.message)
    }
  }

  return model;
}

module.exports = userSchema;
