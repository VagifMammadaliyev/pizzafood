const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const errors = require('../core/exceptions');

var utils = {};

utils._constructBaseUrl = function (options) {
  return `${options.protocol}://${options.hostname}:${options.port}/`;
};

utils.parseJson = function (requestContent) {
  try {
    return JSON.parse(requestContent);
  } catch {
    return null;
  }
};

utils.cookRequestData = function (method, parsedUrl, headers, content) {
  /**
   * Cooks request data out of parsed url and request content.
   * All low level things is done at this point. User of
   * interface must not deal with request parsing, etc.
   */
  const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
  const query = parsedUrl.searchParams;
  // try to get JSON out of content.
  // Ignore content-type, if we can parse it to JSON
  // then everything is OK
  const jsonData = utils.parseJson(content);
  // user of request can rely on following variable
  // and if its true he can be sure JSON was passed
  // as content
  const isJson = jsonData !== null;
  // optionally check for content type, so user
  // can see whether request data was passed as JSON intentionally
  const isJsonContentType = headers['content-type'] === 'application/json';
  return {
    path: path,
    method: method.toUpperCase(),
    query: query,
    headers: headers,
    isJson: isJson,
    isJsonContentType: isJsonContentType,
    data: jsonData,
  };
};

utils.processRequest = function (req, res, options) {
  const parsedUrl = new url.URL(req.url, utils._constructBaseUrl(options));
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', function (rawData) {
    buffer += decoder.write(rawData);
  });
  req.on('end', function () {
    buffer += decoder.end();
    // prepare request data, its interface must be easy to use
    const request = utils.cookRequestData(
      req.method,
      parsedUrl,
      req.headers,
      buffer
    );
    const services =
      typeof options.services === 'object' ? options.services : [];
    let choosenService = null;
    let allowedMethods = null;
    for (const service of services) {
      const matchResult = service.route.exec(request.path);
      if (matchResult) {
        if (matchResult.groups) {
          request.args = matchResult.groups;
        } else {
          request.args = null;
        }
        choosenService = service.handler;
        allowedMethods = service.allowedMethods;
        break;
      }
    }
    try {
      res.setHeader('Content-Type', 'application/json');
      if (!choosenService) {
        throw new errors.NotFound();
      } else if (
        Array.isArray(allowedMethods) &&
        allowedMethods.length &&
        allowedMethods.indexOf(request.method) < 0
      ) {
        throw new errors.MethodNotAllowed(request.method);
      }
      choosenService(request, function (status, response, headers) {
        status = typeof status == 'number' ? status : 200;
        // respect user's headers too
        if (typeof headers === 'object') {
          for (const [headerKey, headerValue] of Object.entries(headers)) {
            res.setHeader(headerKey, headerValue);
          }
        }
        res.writeHead(status);
        res.end(typeof response === 'object' ? JSON.stringify(response) : '');
      });
    } catch (err) {
      options.exceptionHandler(req, res, err);
    }
  });
};

/**
 *  Default exception handler
 */
utils.exceptionHandler = function (req, res, err) {
  if (
    typeof err.serialize === 'function' &&
    typeof err.statusCode === 'number'
  ) {
    // this block will handle all
    // exceptions that are defined like
    // core/exceptions. If it is enough for
    // user, then there is no sense in defining
    // custom exception handler
    res.writeHead(err.statusCode);
    const errorData = err.serialize();
    res.end(typeof errorData === 'object' ? JSON.stringify(errorData) : '');
  } else {
    console.error(err);
    const serverError = new errors.ServerError();
    res.writeHead(serverError.statusCode);
    res.end(JSON.stringify(serverError.serialize()));
  }
};

module.exports = utils;
