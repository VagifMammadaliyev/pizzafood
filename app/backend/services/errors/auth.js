var errors = {};

errors.InvalidToken = function () {
  this.statusCode = 400;
  this.serialize = function () {
    return {
      detail: 'Invalid authentication token',
    };
  };
};

errors.LoginRequired = function () {
  this.statusCode = 403;
  this.serialize = function () {
    return {
      detail:
        'You are not authenticated.' +
        ' Either token is invalid or not provided at all',
    };
  };
};

module.exports = errors;
