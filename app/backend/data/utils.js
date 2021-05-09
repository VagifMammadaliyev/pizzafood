const fs = require('fs');
const path = require('path');
const core = require('../core');

var utils = {};

utils.getCollectionDirectory = function (collectionName) {
  return path.join(core.config.dataDirectory, collectionName);
};

utils.getEntityFilename = function (collectionName, entityIdentifier) {
  return path.join(
    utils.getCollectionDirectory(collectionName),
    entityIdentifier
  );
};

module.exports = utils;
