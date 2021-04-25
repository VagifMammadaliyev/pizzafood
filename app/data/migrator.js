/**
 * This file is to be called directly.
 * This file is not inteded to be
 * imported (required) from another JS file.
 */
const fs = require('fs');
const utils = require('./utils');

// Just add collection names to this array
// and then run "make migrate" from your shell
const collectionNames = ['users', 'pizzas'];

/**
 * Just check for each collection name
 * and create directories if necessary.
 *
 * This will also create base directory specified in config
 * if it does not exist already.
 */
function migrate(collectionNames) {
  for (const collectionName of collectionNames) {
    const collectionDirectory = utils.getCollectionDirectory(collectionName);
    if (!fs.existsSync(collectionDirectory)) {
      fs.mkdirSync(collectionDirectory, { recursive: true });
      console.log(
        '\x1b[32m%s\x1b[0m',
        `Collection '${collectionName}' is created`
      );
    } else {
      console.log(
        '\x1b[33m%s\x1b[0m',
        `Collection '${collectionName}' already exists`
      );
    }
  }
}

migrate(collectionNames);
