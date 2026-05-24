const path = require('path');
const debug = require('debug');
const parse = require('pg-connection-string').parse;
const dotenv = require('dotenv');

function getEnvironment() {
  return process.env.NODE_ENV || 'development';
}

function initializeEnv() {
  dotenv.config({
    path: path.resolve(process.cwd(), `.env.${getEnvironment()}`),
  });
}

function parseHerokuUrlIfPresent() {
  const url = process.env.DATABASE_URL;

  if (url === undefined) {
    return {};
  }

  const config = parse(url);

  // Heroku necesita sí o sí SSL, y para eso hay que habilitar el driver nativo.
  return {
    ...config,
    username: config.user,
    native: true,
  };
}

function normalizePort(val) {
  const portNum = parseInt(val, 10);

  if (Number.isNaN(portNum)) {
    // named pipe
    return val;
  }

  if (portNum >= 0) {
    // port number
    return portNum;
  }

  return false;
}

function initializeConfig() {
  const environment = getEnvironment();
  let dbConfig = {
    username: 'postgres',
    password: '112233',
    database: 'gestion_laboratorios',
    host: process.env.SQL_HOST || 'localhost',
    port: process.env.SQL_PORT || '5432',
    dialect: 'postgres',
    logging: debug('sequelize'),
  };
  if (environment === 'development') {
    dbConfig.seederStorage = 'sequelize';
  } else if (environment === 'test') {
    dbConfig.database =
      process.env.SQL_TEST_DATABASE ||
      process.env.SQL_DATABASE ||
      'gestion_laboratorios_test';
  } else if (environment === 'production') {
    dbConfig = { ...dbConfig, ...parseHerokuUrlIfPresent() };
  }
  return {
    db: dbConfig,
    port: normalizePort(process.env.PORT || '3001'),
  };
}

initializeEnv();

module.exports = initializeConfig();
