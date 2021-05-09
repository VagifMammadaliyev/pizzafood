const auth = require('./auth');
const health = require('./health');
const pizzas = require('./pizzas');
const carts = require('./carts');

const services = [...health, ...auth, ...pizzas, ...carts];

module.exports = services;
