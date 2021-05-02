const path = require('path');

var config = {
  prod: {
    debug: false,
    httpPort: process.env.PIZZAFOOD_HTTP_PORT,
    httpsPort: process.env.PIZZAFOOD_HTTPS_PORT,
    dataDirectory: process.env.PIZZAFOOD_DATADIR,
    secretKey: process.env.PIZZAFOOD_SECRET_KEY,
    stripe: {
      baseUrl: 'https://api.stripe.com',
      createSessionUrl: '/v1/checkout/sessions',
      createProductUrl: '/v1/products',
      createPriceUrl: '/v1/prices',
      successUrl: '/checkout/success',
      cancelUrl: '/checkout/cancel',
      secretKey: process.env.STRIPE_LIVE_SECRET_KEY,
      publicKey: process.env.STRIPE_LIVE_PUBLIC_KEY,
    },
  },
  dev: {
    debug: true,
    httpPort: 80,
    httpsPort: false,
    dataDirectory: path.join(__dirname, '../.db'),
    secretKey:
      '506543c2f3698743dd21608ca357f9c5a0c10ae158819be6c8cfdfc650f1d594',
    stripe: {
      baseUrl: 'https://api.stripe.com',
      createSessionUrl: '/v1/checkout/sessions',
      createProductUrl: '/v1/products',
      createPriceUrl: '/v1/prices',
      successUrl: '/checkout/success',
      cancelUrl: '/checkout/cancel',
      secretKey: process.env.STRIPE_TEST_SECRET_KEY,
      publicKey: process.env.STRIPE_TEST_PUBLIC_KEY,
    },
  },
};

var selectedConfig =
  process.env.NODE_ENV in config ? config[process.env.NODE_ENV] : config.dev;

module.exports = selectedConfig;
