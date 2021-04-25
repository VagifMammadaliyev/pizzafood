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
    let errored = false;
    if (!Array.isArray(service.methods)) {
      errored = true;
      console.log(
        '\x1b[31m%s\x1b[0m',
        `Service "${service.name}" has not defined` +
          ' allowed methods or .method is not an array'
      );
    }
    if (!service.route) {
      errored = true;
      console.log(
        '\x1b[31m%s\x1b[0m',
        `Service "${service.name}" has not defined routes`
      );
    }

    if (!errored) {
      server.route(service.route, service.methods, service);
    }
  }

  server.serve();
};

app.init();

module.exports = app;
