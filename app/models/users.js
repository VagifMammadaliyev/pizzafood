const hashPassword = require('../core/utils').hashString;
const exc = require('../core/exceptions');
const data = require('../data');

var users = {};

users.load = function (email, callback) {
  data.read('users', email, function (err, data) {
    if (!err && data) {
      const user = new users.User(data.name, data.email, data.address);
      user.hashedPassword = data.hashedPassword;
      callback(user);
    } else {
      throw err;
    }
  });
};

users.delete = function (email, callback) {
  data.delete('users', email, function (err) {
    if (!err) {
      callback();
    } else {
      throw err;
    }
  });
};

users.update = function (user, callback) {
  data.update('users', user.email, user.prepare(), function (err) {
    if (!err) {
      callback();
    } else {
      throw err;
    }
  });
};

users.User = function (name, email, address, rawPassword) {
  this.email = email;
  this.name = name;
  this.address = address;
  this.hashedPassword = null;
  this._password = rawPassword; // this is needed on form submission validation

  this.setPassword = function (password) {
    this.hashedPassword = hashPassword(password);
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
      throw new exc.InvalidData(errors);
    }
  };

  this.save = function (callback) {
    this.setPassword(this._password);
    data.create('users', this.email, this.prepare(), function (err) {
      if (!err) {
        callback();
      } else {
        throw err;
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
    };
  };
};

module.exports = users;
