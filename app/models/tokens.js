const authExc = require('../services/errors/auth');
const utils = require('../core/utils');
const data = require('../data');
const users = require('./users');

var tokens = {};

tokens.revoke = function (tokenValue) {
  return new Promise((resolve, reject) => {
    data.delete('tokens', utils.hashString(tokenValue), function (err) {
      if (!err) {
        resolve();
      } else {
        reject(err);
      }
    });
  });
};

tokens.loadUserFromToken = function (tokenValue) {
  return new Promise((resolve, reject) => {
    const hashedToken = utils.hashString(tokenValue);
    data.read('tokens', hashedToken, function (err, tokenData) {
      if (!err) {
        const token = tokens.fromData(tokenData);
        if (!token.isExpired()) {
          users
            .load(token.userEmail)
            .then((user) => resolve(user))
            .catch((err) => reject(err));
        } else {
          reject(new authExc.InvalidToken());
        }
      } else {
        reject(err);
      }
    });
  });
};

tokens.fromData = function (tokenData) {
  const token = new tokens.Token(tokenData.userEmail);
  token.expiresOn = tokenData.expiresOn;
  return token;
};

tokens.Token = function (userEmail, generate = true) {
  this.userEmail = userEmail;
  if (generate) {
    this.generatedToken = utils.getRandomString(64);
    this.hashedToken = utils.hashString(this.generatedToken);
    this.expiresIn = 1 * utils.time.hour;
    this.expiresOn = new Date(Date.now() + this.expiresIn);
  }

  this.save = function () {
    return new Promise((resolve, reject) => {
      data.create('tokens', this.hashedToken, this.prepare(), function (err) {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
  };

  this.toJson = function () {
    return {
      token: this.generatedToken,
      expires: this.expiresIn / 1000,
    };
  };

  this.prepare = function () {
    return {
      hashedToken: this.hashedToken,
      expiresOn: this.expiresOn,
      userEmail: this.userEmail,
    };
  };

  this.isExpired = function () {
    return Date.now() > this.expiresOn;
  };
};

module.exports = tokens;
