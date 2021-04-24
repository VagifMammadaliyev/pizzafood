const exc = require('../../core/exceptions');

var security = {};

security.AcceptJsonOnly = function () {
  this.process = function (req, resWriter, resHandler) {
    if (!req.isJsonContentType) {
      throw new exc.UnsupportedMediaType('application/json');
    } else {
      this.next(req, resWriter, resHandler);
    }
  };
};

security.RequireOnlyJson = function () {
  this.process = function (req, resWriter, resHandler) {
    if (req.headers.accept != 'application/json') {
      throw new exc.NotAcceptable('application/json');
    } else {
      this.next(req, resWriter, resHandler);
    }
  };
};

security.Common = function () {
  this.process = function (req, resWriter, resHandler) {
    resWriter.setHeader('Cache-Control', 'no-store');
    resWriter.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    resWriter.setHeader('X-Content-Type-Options', 'nosniff');
    resWriter.setHeader('X-Frame-Options', 'DENY');
    resWriter.setHeader('Referrer-Policy', 'no-referrer');
    resWriter.setHeader('Feature-Policy', "'none'");
    this.next(req, resWriter, resHandler);
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
