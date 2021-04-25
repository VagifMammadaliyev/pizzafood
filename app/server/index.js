const http = require('http');
const https = require('https');
const serverUtils = require('./utils');

var server = {};

server._middlewares = [];
server._services = [];
server._exceptionHandler = null;

server._getListener = function (protocol) {
  return function (req, res) {
    serverUtils.processRequest(req, res, {
      services: server._services,
      protocol: protocol,
      middlewares: server._middlewares,
      port: server.config[`${protocol}Port`],
      hostname: server.config.hostname,
      exceptionHandler: server._exceptionHandler
        ? server._exceptionHandler
        : serverUtils.exceptionHandler,
    });
  };
};

server.use = function (middleware) {
  if (Array.isArray(middleware)) {
    for (const _middleware of middleware) {
      server.use(_middleware);
    }
  } else {
    // chain middlewares
    if (server._middlewares.length) {
      // define a function to be called as next.
      // this is a much easier than handling next as a class instance
      // with process function
      server._middlewares[server._middlewares.length - 1].next = function (
        request,
        responseWriter,
        exceptionHandler
      ) {
        middleware.process(request, responseWriter, exceptionHandler);
      };
      // we do it here once, when application starts as opposed
      // to "middleware finalizer logic". Because that "logic"
      // depends on some context with "req", "res" objects.
    }
    server._middlewares.push(middleware);
  }
};

server.setExceptionHandler = function (handlerFunction) {
  // if this function not called default exception handler will be used.
  // default exception handler is defined in server/utils
  server._exceptionHandler = handlerFunction;
};

server.route = function (routeRegex, allowedMethods, handlerFunction) {
  server._services.push({
    route: routeRegex,
    handler: handlerFunction,
    allowedMethods: allowedMethods.map(function (methoName) {
      return methoName.toUpperCase();
    }),
  });
};

server.init = function (config) {
  server.config = config;
  server._httpServer = http.createServer(server._getListener('http'));
  if (typeof server.config.httpsPort === 'number') {
    const httpsOptions = {};
    server._httpsServer = https.createServer(
      httpsOptions,
      server._getListener('https')
    );
  }
};

server.serve = function () {
  if (server._httpServer) {
    server._httpServer.listen(server.config.httpPort, function () {
      console.log(`Serving HTTP on port ${server.config.httpPort}`);
    });
  }
  if (server._httpsServer) {
    server._httpsServer.listen(server.config.httpsPort, function () {
      console.log(`Serving HTTPS on port ${server.config.httpsPort}`);
    });
  }
};

module.exports = server;
