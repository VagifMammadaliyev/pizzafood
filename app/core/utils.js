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

/**
 * A very simple JSON to application/x-www-form-urlencoded converter.
 * This function will not deal with too nested objects.
 */
utils.jsonToFormEncoded = function (data) {
  let fixedJson = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value == 'object') {
      if (Array.isArray(value) && value.length > 0) {
        for (let i = 0; i < value.length; i++) {
          if (Object.keys(value[i]).length > 0) {
            if (typeof value[i] == 'string') {
              fixedJson[`${key}[${i}]`] = value[i];
            } else {
              for (const [innerKey, innerValue] of Object.entries(value[i])) {
                fixedJson[`${key}[${i}][${innerKey}]`] = innerValue;
              }
            }
          } else {
            fixedJson[`${key}[${i}]`] = value[i];
          }
        }
      } else if (Object.keys(value).length > 0) {
        for (const [innerKey, innerValue] of Object.entries(value)) {
          fixedJson[`${key}[${innerKey}]`] = innerValue;
        }
      }
    } else {
      fixedJson[key] = value;
    }
  }
  return fixedJson;
};

module.exports = utils;
