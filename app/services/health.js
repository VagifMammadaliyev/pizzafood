function check(req, res) {
  res(200, { detail: 'Healthy!' });
}
check.route = /^health$/;
check.methods = ['GET'];

const services = [check];
module.exports = services;
