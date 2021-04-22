var config = {
  prod: {},
  dev: {
    httpPort: 80,
    httpsPort: false,
  },
};

var selectedConfig =
  process.env.NODE_ENV in config ? config[process.env.NODE_ENV] : config.dev;

module.exports = selectedConfig;
