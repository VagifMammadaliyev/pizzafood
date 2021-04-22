const http = require('http');
const https = require('https');
const serverUtils = require('./utils');

var server = {};

server._middlewares = [];
server._services = [];
server._handlers = {
  404: function (request, response) {
    response(404, { detail: 'Not found' });
  },
};

server._getListener = function (protocol) {
  return function (req, res) {
    serverUtils.processRequest(req, res, {
      services: server._services,
      handlers: server._handlers,
      protocol: protocol,
      port: server.config[`${protocol}Port`],
      hostname: server.config.hostname,
    });
  };
};

server.use = function (middleware) {
  server._middlewares.push(middleware);
};

server.handler = function (status, handlerFunction) {
  server._handlers[status] = handlerFunction;
};

server.route = function (routeRegex, handlerFunction) {
  server._services.push({
    route: routeRegex,
    handler: handlerFunction,
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

server.setDefaultHandlers = function () {};

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
