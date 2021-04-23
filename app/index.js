const server = require('./server');
const config = require('./core/config');

var app = {};

app.init = function () {
  server.init(config);
  server.serve();
};

app.init();

module.exports = app;
