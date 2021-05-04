const authExc = require('./errors/auth');
const exc = require('../core/exceptions');
const pizzas = require('../models/pizzas');
const carts = require('../models/carts');

function _validateCartAddition(data) {
  if (!data) {
    data = {};
  }
  return new Promise((resolve, reject) => {
    let errors = {};
    if (!data.pizza) {
      errors.pizza = 'Pizza ID is required';
    }
    if (Object.keys(errors).length !== 0) {
      reject(new exc.InvalidData(errors));
    }

    // check if we can get that pizza at all
    pizzas
      .loadById(data.pizza)
      .then(resolve)
      .catch(() => {
        reject(
          new exc.InvalidData({
            pizza: 'Pizza with this ID does not exist',
          })
        );
      });
  });
}

function _validateCartRemoval(data, user) {
  if (!data) {
    data = {};
  }
  return new Promise((resolve, reject) => {
    let errors = {};
    if (!data.pizza) {
      errors.pizza = 'Pizza ID is required';
    }
    if (Object.keys(errors).length !== 0) {
      reject(new exc.InvalidData(errors));
    }

    user
      .getCart()
      .then((cart) => {
        if (cart.pizzas.indexOf(data.pizza) > -1) {
          resolve(cart, data.pizza);
        } else {
          reject(
            new exc.InvalidData({
              pizza: 'This pizza is not in your shopping cart :(',
            })
          );
        }
      })
      .catch(reject);
  });
}

function cart(req, res, exc) {
  if (!req.user.isAuthenticated) {
    exc(new authExc.LoginRequired());
  } else {
    if (req.method === 'POST') {
      let pizzaToBeAdded = null;
      _validateCartAddition(req.data)
        .then((pizza) => {
          pizzaToBeAdded = pizza;
          return req.user.getCart();
        })
        .then((cart) => {
          cart.addPizza(pizzaToBeAdded);
          return cart.save(false);
        })
        .then(() => {
          res(200, { detail: 'Added to cart successfully' });
        })
        .catch(exc);
    } else if (req.method === 'GET') {
      req.user
        .getCart()
        .then((cart) => {
          return cart.toJson();
        })
        .then((responseData) => res(200, responseData))
        .catch(exc);
    } else {
      _validateCartRemoval(req.data, req.user)
        .then((cart, pizzaId) => {
          cart.removePizza(pizzaId);
          cart.save(false);
        })
        .then(() => {
          res(200, { detail: 'Removed from cart successfully' });
        })
        .catch(exc);
    }
  }
}
cart.methods = ['GET', 'POST', 'DELETE'];
cart.route = /^cart$/;

function checkout(req, res, exc) {
  if (!req.user.isAuthenticated) {
    exc(new authExc.LoginRequired());
  } else {
    req.user
      .getCart()
      .then((cart) => {
        return cart.checkout();
      })
      .then((checkoutResponse) => {
        const checkoutData = checkoutResponse;
        res(checkoutResponse.statusCode, checkoutData);
      })
      .catch(exc);
  }
}
checkout.methods = ['POST'];
checkout.route = /^cart\/checkout$/;

function checkoutResult(req, res, exc) {
  res(200, {
    detail: 'Completed',
    result: req.args.result,
  });
}
checkoutResult.methods = ['GET'];
checkoutResult.route = /^cart\/checkout\/(?<result>(ok|fail))$/;

function checkoutHook(req, res, exc) {
  // we will skip validating that requests came from Stripe (signing etc.)
  let event = req.data;
  if (event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      carts
        .loadByPaymentIntent(session.payment_intent)
        .then((cart) => {
          cart.fulfillCheckout(session);
          res(200, { detail: 'OK' });
        })
        .catch(exc);
    } else {
      res(200, { detail: 'Ignored event' });
    }
  } else {
    res(400, { detail: 'No event' });
  }
}
checkoutHook.methods = ['POST'];
checkoutHook.route = /^cart\/checkout\/payment\-hook$/;

const services = [cart, checkout, checkoutResult, checkoutHook];
module.exports = services;
