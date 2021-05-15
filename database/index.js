const { Client } = require('pg');

const client = new Client({
  user: 'curtiscastro',
  host: 'localhost',
  database: 'superb_api',
  password: '',
  port: 5432,
});
client.connect();

module.exports = client;
