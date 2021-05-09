const users = require('./users');
const tokens = require('./tokens');
const pizzas = require('./pizzas');
const carts = require('./carts');

var models = {};
models.User = users.User;
models.Token = tokens.Token;
models.Pizza = pizzas.Pizza;
models.Cart = carts.Cart;
models.users = users;
models.tokens = tokens;
models.pizzas = pizzas;
models.carts = carts;

module.exports = models;
