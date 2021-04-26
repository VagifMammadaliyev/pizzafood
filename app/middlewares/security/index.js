const exc = require('../../core/exceptions');

var security = {};

security.AcceptJsonOnly = function () {
  this.process = function (req, res, e) {
    if (!req.isJson && req.data) {
      e(new exc.UnsupportedMediaType('application/json'));
    } else {
      this.next(req, res, e);
    }
  };
};

security.RequireOnlyJson = function () {
  this.process = function (req, res, e) {
    if (req.headers.accept != 'application/json') {
      e(new exc.NotAcceptable('application/json'));
    } else {
      this.next(req, res, e);
    }
  };
};

security.Common = function () {
  this.process = function (req, res, e) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Feature-Policy', "'none'");
    this.next(req, res, e);
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
