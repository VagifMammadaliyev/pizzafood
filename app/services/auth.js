const exc = require('../core/exceptions');
const tokens = require('../models/tokens');
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
        return user.save();
      })
      .then(() => {
        res(201, user.toJson());
      })
      .catch(exc);
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
    const user = models.users.load(email).then((user) => {
      if (user.checkPassword(password)) {
        resolve(user);
      } else {
        reject(invalidCreds);
      }
    });
  });
}

// Login
function login(req, res, exc) {
  const validationError = _validateLogin(req.data);
  let token = null;
  if (validationError) {
    exc(validationError);
  } else {
    _authenticate(req.data.email, req.data.password)
      .then((user) => {
        token = new models.Token(user.email, true);
        token.user = user;
        // save tokens to user, this will necessary for
        // logout from all devices functionality
        token.user.hashedLoginTokens.push(token.hashedToken);
        return token.user.save(false);
      })
      .then(() => {
        return token.save();
      })
      .then(() => {
        res(200, {
          token: token.toJson(),
          user: token.user.toJson(),
        });
      })
      .catch(exc);
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
      user: req.user.toJson(),
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
      .catch(exc);
  }
}
logout.methods = ['POST'];
logout.route = /^auth\/logout$/;

// Logout all devices
function logoutAll(req, res, exc) {
  if (!req.user.isAuthenticated) {
    exc(new authExc.LoginRequired());
  } else {
    tokens
      .revokeMultipleByHash(req.user.hashedLoginTokens)
      .then((revokeData) => {
        req.user.hashedLoginTokens = [];
        req.user.save(false);
        return Promise.resolve(revokeData);
      })
      .then((revokeData) => {
        res(200, {
          detail: `Logged out from ${revokeData.revoked} devices`,
          numbers: revokeData,
        });
      })
      .catch(exc);
  }
}
logoutAll.methods = ['POST'];
logoutAll.route = /^auth\/logout-all$/;

const services = [register, login, profile, logout, logoutAll];
module.exports = services;
