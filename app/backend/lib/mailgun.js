const utils = require('../core/utils');
const requests = require('./requests');
const config = require('../core/config');

var mailgun = {};

mailgun._constructAuthHeader = function (apiKey) {
  const base64authKey = Buffer.from(`api:${apiKey}`).toString('base64');
  return `Basic ${base64authKey}`;
};

mailgun.send = function (email, subject, message) {
  const domainName = config.mailgun.domainName;
  const apiKey = config.mailgun.apiKey;
  return requests.post(
    `https://api.mailgun.net/v3/${domainName}/messages`,
    utils.jsonToFormEncoded({
      from: `Pizzafood <mailgun@${domainName}>`,
      to: email,
      subject: subject,
      text: message,
    }),
    {
      Authorization: mailgun._constructAuthHeader(apiKey),
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  );
};

mailgun.sendToUser = function (user, subject, message) {
  return mailgun.send(user.email, subject, message);
};

module.exports = mailgun;
