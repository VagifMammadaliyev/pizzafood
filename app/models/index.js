const users = require('./users');
const tokens = require('./tokens');

var models = {};
models.User = users.User;
models.Token = tokens.Token;
models.users = users;
models.tokens = tokens;

module.exports = models;
