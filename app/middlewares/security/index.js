const exc = require('../../core/exceptions');

var security = {};

security.AcceptJsonOnly = function () {
  this.process = function (req, res, exc) {
    if (!req.isJson) {
      throw new exc.UnsupportedMediaType('application/json');
    } else {
      this.next(req, res, exc);
    }
  };
};

security.RequireOnlyJson = function () {
  this.process = function (req, res, exc) {
    if (req.headers.accept != 'application/json') {
      throw new exc.NotAcceptable('application/json');
    } else {
      this.next(req, res, exc);
    }
  };
};

security.Common = function () {
  this.process = function (req, res, exc) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Feature-Policy', "'none'");
    this.next(req, res, exc);
  };
};

function secure(options) {
  if (!options) {
    options = {};
  }
  let middlewares = [new security.Common()];
  if (options.acceptJson === true) {
    middlewares.push(new security.AcceptJsonOnly());
  }
  if (options.requireJson === true) {
    middlewares.push(new security.RequireOnlyJson());
  }
  return middlewares;
}

module.exports = secure;
