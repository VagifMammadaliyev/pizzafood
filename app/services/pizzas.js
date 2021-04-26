const pizzas = require('../models/pizzas');

function listPizzas(req, res) {
  pizzas.loadPizzas().then((loadedPizzas) => {
    res(
      200,
      loadedPizzas.map((p) => p.toJson())
    );
  });
}
listPizzas.methods = ['GET'];
listPizzas.route = /^pizzas$/;

const services = [listPizzas];
module.exports = services;
