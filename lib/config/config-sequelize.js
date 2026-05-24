const config = require('./config').default || require('./config');

module.exports = {
  development: config.db,
  test: {
    ...config.db,
    database: 'gestion_laboratorios_test',
  },
  production: config.db,
};
