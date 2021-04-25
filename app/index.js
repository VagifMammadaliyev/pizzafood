const server = require('./server');
const core = require('./core');
const middlewares = require('./middlewares');
const services = require('./services');

var app = {};

app.init = function () {
  server.use(
    middlewares.security({
      acceptJson: true,
      requireJson: false,
    })
  );
  server.init(core.config);

  for (const service of services) {
    server.route(service.route, service.methods, service);
  }

  server.serve();
};

app.init();

module.exports = app;
