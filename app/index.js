const server = require('./server');
const core = require('./core');
const middlewares = require('./middlewares');

const models = require('./models');

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
  server.route(/^users$/, ['POST'], function (req, res) {
    let user = new models.User(
      req.data.name,
      req.data.email,
      req.data.address,
      req.data.password
    );
    user.validate();
    user.save(function () {
      res(201, user.toJson());
    });
  });
  server.serve();
};

app.init();

module.exports = app;
