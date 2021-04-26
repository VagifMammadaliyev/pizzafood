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

tokens.revokeByHash = function (tokenHash) {
  return new Promise((resolve, reject) => {
    data.delete('tokens', tokenHash, function (err) {
      if (!err) {
        resolve();
      } else {
        reject(err);
      }
    });
  });
};

tokens.revokeMultipleByHash = function (tokenHashes) {
  return new Promise((resolve, reject) => {
    // even if there is an error increment the counter.
    // as if token cannot be read most probably it cannot be accessed
    // anymore and it can be considered as invalid.
    let deletedTokens = 0;
    // but keep track of what happened in case caller want the truth
    let actuallyDeleted = 0;
    let notAccessible = 0;
    let notDeletable = 0;
    const tokensCount = tokenHashes.length;
    if (!tokensCount) {
      resolve({ revoked: 0, notAccessible: 0, actuallyDeleted: 0 });
    }
    for (const tokenHash of tokenHashes) {
      data.read('tokens', tokenHash, function (err) {
        if (err) {
          notAccessible++;
          deletedTokens++;
        } else {
          tokens
            .revokeByHash(tokenHash)
            .then(() => {
              actuallyDeleted++;
              deletedTokens++;
              return Promise.resolve();
            })
            .catch(() => {
              notDeletable++;
              deletedTokens++;
              return Promise.resolve();
            })
            .then(() => {
              if (deletedTokens === tokensCount) {
                resolve({
                  revoked: deletedTokens,
                  notAccessible: notAccessible,
                  notDeletable: notDeletable,
                  actuallyDeleted: actuallyDeleted,
                });
              }
            });
        }
        if (deletedTokens === tokensCount) {
          resolve({
            revoked: deletedTokens,
            notAccessible: notAccessible,
            notDeletable: notDeletable,
            actuallyDeleted: actuallyDeleted,
          });
        }
      });
    }
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
