const auth = require('./auth');
const health = require('./health');

const services = [...health, ...auth];

module.exports = services;
