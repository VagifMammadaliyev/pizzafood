const server = require('./server');
const config = require('./core/config');

var app = {};

app.init = function () {
  server.init(config);

  // custom handlers defined as
  server.handler(404, function (req, res) {
    res(
      404,
      { detail: 'This route is not defined' },
      {
        'X-Custom-Header': 'custom-header-val',
      }
    );
  });

  server.route(
    /users\/(?<userId>\d+)\/(?<action>(create|edit|delete))/,
    function (req, res) {
      res(200, { message: 'Regex route works', urlargs: req.urlArgs });
    }
  );
  server.route(/users/);

  server.serve();
};

app.init();

module.exports = app;
