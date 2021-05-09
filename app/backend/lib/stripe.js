const utils = require('../core/utils');
const config = require('../core/config');
const requests = require('./requests');

var stripe = {};

stripe.Stripe = function () {
  this.stripeSettings = config.stripe;
  this.defaultHeaders = {
    Authorization: `Bearer ${this.stripeSettings.secretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  this.getUrl = function (url) {
    return `${this.stripeSettings.baseUrl}${url}`;
  };

  this.createProduct = function (name) {
    const requestData = {
      name: name,
    };
    return requests.post(
      this.getUrl(this.stripeSettings.createProductUrl),
      utils.jsonToFormEncoded(requestData),
      this.defaultHeaders
    );
  };

  this.createPrice = function (amount, currency, product) {
    const requestData = {
      unit_amount: amount,
      currency: currency.toLowerCase(),
      product: product.id,
    };
    return requests.post(
      this.getUrl(this.stripeSettings.createPriceUrl),
      utils.jsonToFormEncoded(requestData),
      this.defaultHeaders
    );
  };

  this.createSession = function (lineItems) {
    const requestData = {
      cancel_url: `${config.hostname}${config.stripe.cancelUrl}`,
      success_url: `${config.hostname}${config.stripe.successUrl}`,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
    };
    return requests.post(
      this.getUrl(this.stripeSettings.createSessionUrl),
      utils.jsonToFormEncoded(requestData),
      this.defaultHeaders
    );
  };
};

module.exports = stripe;
