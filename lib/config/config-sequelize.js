const config = require('./config').default || require('./config');

module.exports = {
  development: config.db,
  test: config.db,
  production: config.db,
};