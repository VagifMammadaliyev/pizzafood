const config = require('./config');
const crypto = require('crypto');

var utils = {};

/**
 * Hashes rawString. Can be used for password hashing.
 * @param {string} rawString
 * @returns string
 */
utils.hashString = function (rawString) {
  return crypto
    .createHmac('sha256', config.secretKey)
    .update(rawString)
    .digest('hex');
};

/**
 * Generates secure random string with provide length
 *
 * @param {number} length
 * @returns string
 */
utils.getRandomString = function (length) {
  var result = [];
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(crypto.randomInt(charactersLength)))
    );
  }
  return result.join('');
};

/**
 * Dummy UUID generator
 * @returns string
 */
utils.UUID = function () {
  return (
    `${utils.getRandomString(4)}-${utils.getRandomString(4)}-` +
    `${utils.getRandomString(4)}-${utils.getRandomString(4)}`
  );
};

utils.time = {};
utils.time.sec = 1000;
utils.time.min = 60 * utils.time.sec;
utils.time.hour = 60 * utils.time.min;
utils.time.day = 24 * utils.time.hour;

module.exports = utils;
