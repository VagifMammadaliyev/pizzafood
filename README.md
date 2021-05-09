# PizzaFood

Example project using just Node.js

## Description

Application provides API for registering users.

- Users can see all available pizzas.
- Users can add pizzas to their shopping carts and then pay for them.
- _Only logged in users can user their carts and place orders._
- After an order is placed, users are able to complete the payment and then receive mail with receipt.

### Payment

Payments are accepted through **Stripe** (sandbox integration)

### Mails

Mails are sent through **Mailgun** integration.

### Technologies used

Just plain Node.js.

## Why?

Actually this project is a Homework Assignment for a [Pirple.com](https://pirple.com) course.
But I have decided to publish it here as a showcase.

## How to's

### Starting application

To start the server run `make serve` from the `app/` directory.

### Stripe checkout

In order to successfully checkout you must edit `frontend/test_checkout.html` file a little bit.

1. Replace stripe public key on **line 21** with yours.
2. Replace `Authorization` header value in **line 30** with what you get after loggging in using the API.
3. Run `stripe listen --forward-to localhost/cart/checkout/payment-hook` in your terminal.
4. Open `frontend/test_checkout.html` in your browser and click "Checkout" button.
5. Enter test card information (4242 4242 4242 4242 with any future date and any security code) and submit.

You should be redirected to a URL with a JSON response like `{"detail":"Completed","result":"ok"}`.
Your cart must be empty at this point and you should receive an email with receipt.

In order for stripe integration work make sure you have set Stripe keys in your environment.
To set keys before running `make serve` to start the API server, write down this to your terimanl:

```sh
# change to backend directory
cd app/backend

# set env vars
export STRIPE_TEST_SECRET_KEY=<YOUR_STRIPE_SECRET_KEY>
export STRIPE_TEST_PUBLIC_KEY=<YOUR_STRIPE_PUBLIC_KEY>

# now you can run this
make serve
```

### Mailgun testing

In order to receive receipt e-mails after checkout process you must add some environment variables:

```sh
# change to backend directory
cd app/backend

# set env vars
export MAILGUN_API_KEY=<YOUR_MAILGUN_API_KEY>
export MAILGUN_DOMAIN_NAME=<YOUR_MAILGUN_DOMAIN_NAME>

# now you can run this
make serve
```

## Additional: Very micro framework

In order to easily complete the task, I've decided to put some effort and implement
a micro framework I could use for purposes of this task.

To make use of my framework on should do the following:

```js
// import server and config
const server = require('./server');
const config = require('./core/config');

var app = {};

app.init = function () {
  // initialize server with selected config. Configuration file
  // is just a hardcoded file with option keys and values.
  // Configuration is selected across defined from NODE_ENV variable
  server.init(config);

  // To define a route, just provide a regex path and handler function that must write to res.
  server.route(
    /users\/(?<userId>\d+)\/(?<action>(create|edit|delete))/, // make sure to define a capturing group
    ['POST', 'DELETE', 'PUT'], // define allowed methods
    function (req, res) {
      res(200, {
        message: 'Regex route works',
        args: {
          userId: req.args.userId, // access url arguments
          action: req.args.action,
        },
        query: {
          time: req.query.get('time'), // access query params
        },
        data: {
          contactId: req.data.contactId,
        },
      });
    }
  );

  // finally just call the serve function, ports, hostnames and etc
  // are defined in configuration file (core/config)
  server.serve();
};

// initialize the app
app.init();
```

To test this API make a `POST` request to 'http://localhost/users/2/edit?time=16:00' with following body:

```json
{
  "contactId": 2
}
```

Example using HTTPie:

```sh
pip3 install httpie
http POST 'http://localhost/users/2/edit?time=16:00' contactId=2
```
