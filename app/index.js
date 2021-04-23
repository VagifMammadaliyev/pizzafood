const server = require('./server');
const core = require('./core');

var app = {};

app.init = function () {
  server.init(core.config);
  server.serve();
};

app.init();

module.exports = app;
