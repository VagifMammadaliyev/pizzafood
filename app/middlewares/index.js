const security = require('./security');
const auth = require('./auth');

var mws = {};
mws.security = security;
mws.auth = auth;

module.exports = mws;
