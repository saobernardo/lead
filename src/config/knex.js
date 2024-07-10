const knex = require('knex');

require('dotenv').config({
  path: '.env'
});

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DATABASE_DB
  }
});

module.exports = db;
