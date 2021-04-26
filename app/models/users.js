const hashPassword = require('../core/utils').hashString;
const exc = require('../core/exceptions');
const data = require('../data');
const carts = require('../models/carts');

var users = {};

users.load = function (email) {
  return new Promise((resolve, reject) => {
    data.read('users', email, function (err, data) {
      if (!err && data) {
        const user = new users.User(data.name, data.email, data.address);
        if (data.hashedLoginTokens) {
          user.hashedLoginTokens = data.hashedLoginTokens;
        }
        if (data.cartId) {
          user.cartId = data.cartId;
        }
        user.hashedPassword = data.hashedPassword;
        resolve(user);
      } else {
        reject(err);
      }
    });
  });
};

users.delete = function (email) {
  return new Promise((resolve, reject) => {
    data.delete('users', email, function (err) {
      if (!err) {
        resolve();
      } else {
        reject(err);
      }
    });
  });
};

users.update = function (user) {
  return new Promise((resolve, reject) => {
    data.update('users', user.email, user.prepare(), function (err) {
      if (!err) {
        resolve();
      } else {
        reject(err);
      }
    });
  });
};

users.User = function (name, email, address, rawPassword) {
  this.email = email;
  this.name = name;
  this.address = address;
  this.hashedPassword = null;
  this.hashedLoginTokens = [];
  this.cartId = null;
  this.cart = null;
  this._password = rawPassword; // this is needed on form submission validation

  this.setPassword = function (password) {
    this.hashedPassword = hashPassword(password);
  };

  this.checkPassword = function (password) {
    return hashPassword(password) === this.hashedPassword;
  };

  this.validate = function () {
    let errors = {};

    let nameErrors = [];
    if (!this.name) {
      nameErrors.push('Name is required');
    } else if (!/^[a-zA-Z]{1,50}$/.test(this.name)) {
      nameErrors.push(
        'Name must contain only letters' +
          ' and must be at most 50 symbols long'
      );
    }

    let emailErrors = [];
    if (!this.email) {
      emailErrors.push('Email is required');
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this.email)) {
      emailErrors.push('Please provide a valid e-mail address');
    }

    let addressErrors = [];
    if (!this.address) {
      addressErrors.push('Street address is required');
    } else if (!/^([\w-\s]|\.){1,255}$/.test(this.address)) {
      addressErrors.push('Please provide a valid street address');
    }
    let passwordErrors = [];
    if (!this._password) {
      passwordErrors.push('Password is required');
    }
    if (!/[0-9]{1,}/.test(this._password)) {
      passwordErrors.push('Password must contain at least one number');
    }
    if (this._password && this._password.length < 8) {
      passwordErrors.push("Password's length must be at least 8");
    }
    if (!/\W{1,}/.test(this._password)) {
      passwordErrors.push(
        'Password must contain at least one special character'
      );
    }
    if (nameErrors.length) {
      errors.name = nameErrors;
    }
    if (emailErrors.length) {
      errors.email = emailErrors;
    }
    if (addressErrors.length) {
      errors.address = addressErrors;
    }
    if (passwordErrors.length) {
      errors.password = passwordErrors;
    }

    if (Object.keys(errors).length !== 0) {
      return new exc.InvalidData(errors);
    }
  };

  this.validateUniqueness = function () {
    return new Promise((resolve, reject) => {
      data.read('users', this.email, function (err, data) {
        if (!err) {
          reject(
            new exc.InvalidData(
              {
                email: 'This e-mail address is taken',
              },
              400
            )
          );
        } else {
          resolve();
        }
      });
    });
  };

  this.save = function (creating = true) {
    return new Promise((resolve, reject) => {
      if (creating) {
        this.setPassword(this._password);
      }
      if (creating) {
        data.create('users', this.email, this.prepare(), function (err) {
          if (!err) {
            resolve();
          } else {
            reject(err);
          }
        });
      } else {
        data.update('users', this.email, this.prepare(), function (err) {
          if (!err) {
            resolve();
          } else {
            reject(err);
          }
        });
      }
    });
  };

  this.toJson = function () {
    return {
      name: this.name,
      email: this.email,
      address: this.address,
    };
  };

  this.prepare = function () {
    return {
      name: this.name,
      email: this.email,
      address: this.address,
      hashedPassword: this.hashedPassword,
      hashedLoginTokens: this.hashedLoginTokens,
      cartId: this.cartId,
    };
  };

  this.getCart = function () {
    return new Promise((resolve, reject) => {
      if (this.cartId) {
        if (this.cart) {
          resolve(this.cart);
        } else {
          return carts
            .load(this.cartId)
            .then((cart) => {
              this.cart = cart;
              resolve(this.cart);
            })
            .catch(reject);
        }
      } else {
        const cart = new carts.Cart();
        cart
          .save()
          .then(() => {
            this.cartId = cart.uuid;
            return this.save(false);
          })
          .then(() => {
            resolve(cart);
          })
          .catch(reject);
      }
    });
  };
};

module.exports = users;
