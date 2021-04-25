const core = require('../core');
var exc = {};

exc.DataError = function (realError) {
  this.statusCode = 500;
  this.detail = 'DB operation failed to complete successfully.';
  this.realError = realError;
  this.serialize = function () {
    if (core.config.debug === true) {
      return {
        detail: this.detail,
        error: this.realError,
      };
    } else {
      return { detail: this.detail };
    }
  };
};

module.exports = exc;
