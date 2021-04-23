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

To start the server run `make serve` from the `app/` directory.

## Very micro framework

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
