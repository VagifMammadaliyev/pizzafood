const pizzas = require('../models/pizzas');
const utils = require('../core/utils');
const data = require('../data');

var carts = {};

carts.load = function (uuid) {
  return new Promise((resolve, reject) => {
    data.read('carts', uuid, function (err, data) {
      if (!err && data) {
        const cart = new carts.Cart();
        cart.pizzas = data.pizzas;
        cart.uuid = uuid;
        resolve(cart);
      } else {
        reject(err);
      }
    });
  });
};

carts.Cart = function () {
  this.uuid = null;
  this.pizzas = [];
  this.loadedPizzas = [];

  this.addPizza = function (pizza) {
    if (this.pizzas.indexOf(pizza.id) < 0) {
      this.pizzas.push(pizza.id);
      // clear pizzas from cache
      this.loadedPizzas = [];
    }
  };

  this.removePizza = function (pizzaId) {
    const index = this.pizzas.indexOf(pizzaId);
    this.pizzas.splice(index, 1);
    // clear pizzas from cache
    this.loadedPizzas = [];
  };

  this.save = function (creating = true) {
    return new Promise((resolve, reject) => {
      if (creating) {
        this.uuid = utils.UUID();
        data.create('carts', this.uuid, this.prepare(), function (err) {
          if (!err) {
            resolve();
          } else {
            reject(err);
          }
        });
      } else {
        data.update('carts', this.uuid, this.prepare(), function (err) {
          if (!err) {
            resolve();
          } else {
            reject(err);
          }
        });
      }
    });
  };

  this.loadPizzas = function () {
    return new Promise((resolve, reject) => {
      pizzas
        .loadByIds(this.pizzas)
        .then((loadedPizzas) => {
          this.loadedPizzas = loadedPizzas;
          resolve(this.loadedPizzas);
        })
        .catch(reject);
    });
  };

  this.toJson = function () {
    return new Promise((resolve, reject) => {
      this.loadPizzas()
        .then((loadedPizzas) => {
          let totalAmount = 0;
          for (const p of loadedPizzas) {
            totalAmount += p.priceInUsd;
          }
          resolve({
            pizzas: loadedPizzas.map((p) => p.toJson()),
            total: {
              amount: totalAmount,
              currency: 'USD',
              currencyDisplay: '$',
              display: `\$ ${totalAmount}`,
            },
          });
        })
        .catch(() => {
          resolve({
            pizzas: [],
            total: null,
          });
        });
    });
  };

  this.prepare = function () {
    return {
      uuid: this.uuid,
      pizzas: this.pizzas,
    };
  };
};

module.exports = carts;
