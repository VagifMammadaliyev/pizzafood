const auth = require('./auth');
const health = require('./health');
const pizzas = require('./pizzas');

const services = [...health, ...auth, ...pizzas];

module.exports = services;
