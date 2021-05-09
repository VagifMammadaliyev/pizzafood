const pizzas = require('../models/pizzas');
const utils = require('../core/utils');
const data = require('../data');
const stripe = require('../lib/stripe');
const mailgun = require('../lib/mailgun');
const exc = require('../core/exceptions');

var carts = {};

carts.load = function (uuid) {
  return new Promise((resolve, reject) => {
    data.read('carts', uuid, function (err, data) {
      if (!err && data) {
        const cart = new carts.Cart();
        cart.userEmail = data.userEmail;
        cart.pizzas = data.pizzas;
        cart.uuid = uuid;
        cart.checkoutData = data.checkoutData;
        resolve(cart);
      } else {
        reject(err);
      }
    });
  });
};

carts.loadByPaymentIntent = function (pi) {
  const predicator = function (cartObject) {
    return (
      cartObject.checkoutData &&
      cartObject.checkoutData.session &&
      cartObject.checkoutData.session.payment_intent === pi
    );
  };

  return new Promise((resolve, reject) => {
    data.find('carts', predicator, function (err, data) {
      if (!err && data) {
        const cart = new carts.Cart();
        cart.userEmail = data.userEmail;
        cart.pizzas = data.pizzas;
        cart.uuid = data.uuid;
        cart.checkoutData = data.checkoutData;
        resolve(cart);
      } else {
        reject(err);
      }
    });
  });
};

carts.Cart = function () {
  this.userEmail = null;
  this.uuid = null;
  this.pizzas = [];
  this.loadedPizzas = [];
  this.checkoutData = null;

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
      userEmail: this.userEmail,
      uuid: this.uuid,
      pizzas: this.pizzas,
      checkoutData: this.checkoutData,
    };
  };

  this.fulfillCheckout = function (user, sessionData) {
    let cart = this;
    const paymentAmount = sessionData.amount_total / 100;
    return mailgun
      .send(
        cart.userEmail,
        'Receipt',
        `You have paid \$ ${paymentAmount.toFixed(2)}`
      )
      .then(() => {
        cart.pizzas = [];
        return cart.save(false);
      });
  };
  this.setCheckoutData = function (key, data) {
    if (!this.checkoutData || typeof this.checkoutData != 'object') {
      this.checkoutData = {};
    }
    this.checkoutData[key] = data;
  };

  this.checkout = function () {
    return new Promise((resolve, reject) => {
      const client = new stripe.Stripe();
      let createdPrices = [];
      let sessionData = {};
      this.loadPizzas()
        .then((loadedPizzas) => {
          for (const loadedPizza of loadedPizzas) {
            client
              .createProduct(loadedPizza.title)
              .then((res) => {
                return client.createPrice(
                  loadedPizza.priceInUsd * 100,
                  'USD',
                  res.json()
                );
              })
              .then((res) => {
                createdPrices.push(res.json());
                if (createdPrices.length == this.pizzas.length) {
                  this.setCheckoutData('prices', createdPrices);
                  return this.save(false);
                }
              })
              .then(() => {
                return client.createSession(
                  createdPrices.map((p) => {
                    return {
                      price: p.id,
                      quantity: 1,
                    };
                  })
                );
              })
              .then((res) => {
                sessionData = res.json();
                this.setCheckoutData('session', sessionData);
                return this.save(false);
              })
              .then(() => {
                resolve(sessionData);
              })
              .catch(reject);
          }
        })
        .catch((e) => {
          reject(new exc.InvalidData('Empty cart, cannot checkout', 400));
        });
    });
  };
};

module.exports = carts;
