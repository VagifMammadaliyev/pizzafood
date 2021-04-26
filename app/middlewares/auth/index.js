const tokens = require('../../models/tokens');

var auth = {};

auth.TokenAuth = function () {
  this.process = function (req, res, exc) {
    tokens
      .loadUserFromToken(req.headers['authorization'])
      .then((user) => {
        user.isAuthenticated = true;
        req.user = user;
        this.next(req, res, exc);
      })
      .catch((err) => {
        this.next(req, res, exc);
      });
  };
};

function authenticate() {
  return [new auth.TokenAuth()];
}

module.exports = authenticate;
