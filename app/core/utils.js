const config = require('./config');
const crypto = require('crypto');

var utils = {};

utils.hashString = function (rawString) {
  return crypto
    .createHmac('sha256', config.secretKey)
    .update(rawString)
    .digest('hex');
};

module.exports = utils;
