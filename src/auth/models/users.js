'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "TEST_SECRET";

const userSchema = (sequelize, DataTypes) => {
  const model = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING,
                allowNull: false, 
    },
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username }, JWT_SECRET);
      }
    }
  });

  model.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
  });

  // Basic AUTH: Validating strings (username, password) 
  model.authenticateBasic = async function (username, password) {
    console.log('authenticateBasic password:',password);
    let user = await this.findOne({ where: { username }, logging: (sql, queryObject) => {
      console.log(sql) //queryObject
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
      const parsedToken = jwt.verify(token, process.env.SECRET);
      const user = this.findOne({ username: parsedToken.username })
      if (user) { return user; }
      throw new Error("User Not Found");
    } catch (e) {
      throw new Error(e.message)
    }
  }

  return model;
}

module.exports = userSchema;
