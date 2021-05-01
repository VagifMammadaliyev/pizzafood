const urllib = require('url');
const querystring = require('querystring');
const http = require('http');
const https = require('https');

var requests = {};

requests.Response = function (statusCode, content, headers) {
  this.statusCode = statusCode;
  this.content = content;
  this.headers = headers;

  this.json = function () {
    try {
      this.json = JSON.parse(this.content);
    } catch {
      this.json = null;
    }
  };
};

requests.post = function (url, payload, headers) {
  return requests.make(url, 'POST', payload, headers);
};
requests.get = function (url, headers) {
  return requests.make(url, 'GET', '', headers);
};
requests.put = function (url, payload, headers) {
  return requests.make(url, 'PUT', payload, headers);
};
requests.patch = function (url, payload, headers) {
  return requests.make(url, 'PATCH', payload, headers);
};
requests.delete = function (url, payload, headers) {
  return requests.make(url, 'DELETE', payload, headers);
};

requests.make = function (url, method, payload, headers) {
  const parsedURL = new urllib.URL(url);
  const pathname = parsedURL.pathname;
  if (parsedURL.searchParams.toString().length > 0) {
    pathname += parsedURL.searchParams.toString();
  }
  let payloadData = null;
  try {
    payloadData = JSON.stringify(payload);
  } catch {
    payloadData = null;
  }
  if (!payloadData) {
    payloadData = querystring.stringify(payload);
  }

  const payloadLength = Buffer.byteLength(payloadData);
  if (!headers) headers = {};
  headers['Content-Length'] = payloadLength;
  const requestDetails = {
    protocol: parsedURL.protocol,
    hostname: parsedURL.hostname,
    method: method,
    path: pathname,
    headers: headers,
  };
  // select module to use
  let httpLib = null;
  switch (parsedURL.protocol) {
    case 'http:':
      httpLib = http;
      break;
    case 'https:':
      httpLib = https;
      break;
    default:
      httpLib = http;
  }

  return new Promise((resolve, reject) => {
    const req = httpLib.request(requestDetails, function (res) {
      const statusCode = res.statusCode;
      let responseContent = '';
      res.on('error', function (e) {
        reject(e);
      });
      res.on('data', function (chunk) {
        responseContent += chunk;
      });
      res.on('end', function () {
        resolve(
          new requests.Response(
            statusCode,
            responseContent.toString(),
            res.headers
          )
        );
      });
    });
    req.on('error', function (e) {
      reject(e);
    });
    req.write(payloadData);
    req.end();
  });
};

module.exports = requests;
