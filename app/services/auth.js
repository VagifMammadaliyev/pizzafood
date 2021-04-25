const exc = require('../core/exceptions');
const models = require('../models');
const authExc = require('./errors/auth');

// Register
function register(req, res, exc) {
  let user = new models.User(
    req.data.name,
    req.data.email,
    req.data.address,
    req.data.password
  );
  const validationError = user.validate();
  if (validationError) {
    exc(validationError);
  } else {
    user
      .validateUniqueness()
      .then(() => {
        user
          .save()
          .then(() => {
            res(201, user.toJson());
          })
          .catch((err) => exc(err));
      })
      .catch((err) => exc(err));
  }
}
register.methods = ['POST'];
register.route = /^auth\/register$/;

function _validateLogin(data) {
  let errors = {};
  if (!data.email) {
    errors.email = 'Email is required in order to log in';
  }
  if (!data.password) {
    errors.password = 'Password is required in order to log in';
  }

  if (Object.keys(errors).length !== 0) {
    return new exc.InvalidData(errors);
  }
}

function _authenticate(email, password) {
  const invalidCreds = new exc.InvalidData('Invalid login credentials', 400);
  return new Promise((resolve, reject) => {
    const user = models.users
      .load(email)
      .then((user) => {
        if (user.checkPassword(password)) {
          resolve(user);
        } else {
          reject(invalidCreds);
        }
      })
      .catch((err) => reject(invalidCreds));
  });
}

// Login
function login(req, res, exc) {
  const validationError = _validateLogin(req.data);
  if (validationError) {
    exc(validationError);
  } else {
    _authenticate(req.data.email, req.data.password)
      .then((user) => {
        const token = new models.Token(user.email, true);
        token
          .save()
          .then(() => {
            res(200, {
              token: token.toJson(),
              user: user.toJson(),
            });
          })
          .catch((err) => exc(err));
      })
      .catch((err) => exc(err));
  }
}
login.methods = ['POST'];
login.route = /^auth\/login$/;

// Profile
function profile(req, res, exc) {
  if (!req.user.isAuthenticated) {
    exc(new authExc.LoginRequired());
  } else {
    res(200, {
      user: req.user,
    });
  }
}
profile.methods = ['GET'];
profile.route = /^auth\/me$/;

// Logout
function logout(req, res, exc) {
  if (!req.user.isAuthenticated) {
    exc(new authExc.LoginRequired());
  } else {
    const currentToken = req.headers['authorization'];
    models.tokens
      .revoke(currentToken)
      .then(() =>
        res(200, {
          detail: 'Logged out',
        })
      )
      .catch((err) => exc(err));
  }
}
logout.methods = ['POST'];
logout.route = /^auth\/logout$/;

const services = [register, login, profile, logout];
module.exports = services;
