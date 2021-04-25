var exc = {};

/**
 * These are core exceptions, user defined exceptions
 * should go in somewhere else.
 *
 * All core exceptions have `serialize` method which
 * user may call in order to get a nice error JSON.
 */

exc.NotFound = function (detail) {
  if (typeof detail !== 'string') {
    detail = 'Not found';
  }
  this.statusCode = 404;
  this.detail = detail;
  this.serialize = function () {
    return {
      detail: this.detail,
    };
  };
};

exc.MethodNotAllowed = function (badMethod) {
  this.statusCode = 405;
  this.badMethod = badMethod;
  this.errorMessage =
    typeof this.badMethod === 'string'
      ? `Method "${this.badMethod}" is not allowed`
      : `Method is not allowed`;
  this.serialize = function () {
    return { detail: this.errorMessage };
  };
};

exc.InvalidData = function (errors, statusCode = 422, strToArr = true) {
  this.statusCode = statusCode;
  this.errorData = {
    errors: null,
    messages: null,
  };

  // if errors is just plain string or a number
  // then add it to an array no matter what
  // strToAttr's value is
  if (typeof errors === 'string' || typeof errors === 'number') {
    errors = [errors];
  }

  if (Array.isArray(errors)) {
    // caller wanted us to display
    // common error messages as an array.
    // Because API client may need to show some
    // text as an alert or something.
    this.errorData.messages = errors;
  } else {
    // errors should be iterable for
    // this code to work
    // TODO: Check if we have done enough
    //       validation to reach this point
    this.errorData.errors = [];
    for (let [errorKey, errorValue] of Object.entries(errors)) {
      // if errorValue is just a plain string
      // then push it into a one element array
      // NOTE: caller may explicitly do not want this
      //       by providing strToArr as false
      if (typeof errorValue === 'string' && strToArr) {
        errorValue = [errorValue];
      }
      // in all other cases just render errorValue itself
      this.errorData.errors.push({
        field: errorKey,
        detail: errorValue,
      });
    }
  }

  this.serialize = function () {
    return this.errorData;
  };
};

exc.ServerError = function (detail) {
  this.statusCode = 500;
  if (typeof detail !== 'string') {
    this.detail = 'Server error';
  } else {
    this.detail = detail;
  }
  this.serialize = function () {
    return { detail: this.detail };
  };
};

exc.UnsupportedMediaType = function (goodMediaTypes) {
  if (typeof goodMediaTypes === 'string') {
    this.goodMediaTypes = [goodMediaTypes];
  } else if (Array.isArray(goodMediaTypes)) {
    this.goodMediaTypes = goodMediaTypes;
  } else {
    this.goodMediaTypes = null;
  }
  this.statusCode = 415;
  this.serialize = function () {
    if (this.goodMediaTypes) {
      return {
        detail: `Allowed media type(s): ${this.goodMediaTypes.join(', ')}`,
      };
    } else {
      return {
        detail: 'Unsupported media type',
      };
    }
  };
};

exc.NotAcceptable = function (goodMediaTypes) {
  if (typeof goodMediaTypes === 'string') {
    this.goodMediaTypes = [goodMediaTypes];
  } else if (Array.isArray(goodMediaTypes)) {
    this.goodMediaTypes = goodMediaTypes;
  } else {
    this.goodMediaTypes = null;
  }
  this.statusCode = 406;
  this.serialize = function () {
    if (this.goodMediaTypes) {
      return {
        detail: `Acceptable media type(s): ${this.goodMediaTypes.join(', ')}`,
      };
    } else {
      return {
        detail: 'Unacceptable media type',
      };
    }
  };
};

module.exports = exc;
