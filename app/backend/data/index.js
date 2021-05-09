const fs = require('fs');
const utils = require('./utils');
const exc = require('./exceptions');

var data = {};

data.create = function (
  collectionName,
  entityIdentifier,
  entityData,
  callback
) {
  const entityFilename = utils.getEntityFilename(
    collectionName,
    entityIdentifier
  );
  fs.open(entityFilename, 'wx', function (err, fd) {
    if (!err && fd) {
      const entityDataString = JSON.stringify(entityData);
      fs.writeFile(fd, entityDataString, function (err) {
        if (!err) {
          fs.close(fd, function (err) {
            if (!err) {
              callback(false);
            } else {
              callback(new exc.DataError(err));
            }
          });
        } else {
          callback(new exc.DataError(err));
        }
      });
    } else {
      callback(new exc.DataError(err));
    }
  });
};

data.read = function (collectionName, entityIdentifier, callback) {
  const entityFilename = utils.getEntityFilename(
    collectionName,
    entityIdentifier
  );
  fs.readFile(entityFilename, 'utf-8', function (err, data) {
    if (!err) {
      try {
        data = JSON.parse(data);
      } catch {
        callback(new exc.DataError(`Cannot parse to json: ${data}`));
      }
      callback(false, data);
    } else {
      callback(new exc.DataError(err), null);
    }
  });
};

data.update = function (
  collectionName,
  entityIdentifier,
  entityData,
  callback
) {
  const entityFilename = utils.getEntityFilename(
    collectionName,
    entityIdentifier
  );
  fs.open(entityFilename, 'r+', function (err, fd) {
    if (!err && fd) {
      var entityDataString = JSON.stringify(entityData);
      fs.ftruncate(fd, 0, function (err) {
        if (!err) {
          fs.writeFile(fd, entityDataString, function (err) {
            if (!err) {
              fs.close(fd, function (err) {
                if (!err) {
                  callback(false);
                } else {
                  callback(new exc.DataError(err));
                }
              });
            } else {
              callback(new exc.DataError(err));
            }
          });
        } else {
          callback(new exc.DataError(err));
        }
      });
    } else {
      callback(new exc.DataError(err));
    }
  });
};

data.delete = function (collectionName, entityIdentifier, callback) {
  const entityFilename = utils.getEntityFilename(
    collectionName,
    entityIdentifier
  );
  fs.unlink(entityFilename, function (err) {
    if (!err) {
      callback(false);
    } else {
      callback(new exc.DataError(err));
    }
  });
};

data.list = function (collectionName, callback) {
  fs.readdir(
    utils.getCollectionDirectory(collectionName),
    function (err, dataList) {
      if (!err && dataList && dataList.length > 0) {
        var entityIdentifiers = [];
        dataList.forEach(function (entityIdentifier) {
          entityIdentifiers.push(entityIdentifier);
        });
        callback(false, entityIdentifiers);
      } else {
        callback(new exc.DataError(err), null);
      }
    }
  );
};

data.find = function (collectionName, predicator, callback) {
  data.list(collectionName, function (err, entityIdentifiers) {
    if (!err) {
      let checkedCount = 0;
      for (const entityIdentifier of entityIdentifiers) {
        data.read(collectionName, entityIdentifier, function (err, data) {
          checkedCount += 1;
          if (!err) {
            if (predicator(data)) {
              callback(false, data);
            }
          } else {
            callback(new exc.DataError(err), null);
          }

          if (checkedCount === entityIdentifiers.length) {
            callback(false, null);
          }
        });
      }
    } else {
      callback(new exc.DataError(err), null);
    }
  });
};

module.exports = data;
