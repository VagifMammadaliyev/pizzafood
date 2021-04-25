const server = require('./server');
const core = require('./core');
const middlewares = require('./middlewares');

var app = {};

app.init = function () {
  server.use(
    middlewares.security({
      acceptJson: true,
      requireJson: false,
    })
  );
  server.init(core.config);
  server.route(/^health-check$/, ['GET'], function (req, res) {
    res(200, { detail: 'OK' });
  });
  server.serve();
};

app.init();

module.exports = app;
