const server = require('./server');
const config = require('./core/config');

var app = {};

app.init = function () {
  server.init(config);
  server.route(
    /users\/(?<userId>\d+)\/(?<action>(create|edit|delete))/,
    function (req, res) {
      res(200, { message: 'Regex route works', urlargs: req.urlArgs });
    }
  );
  server.serve();
};

app.init();

module.exports = app;
