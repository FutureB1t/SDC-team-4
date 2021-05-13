const { Client } = require('pg');

const client = new Client({
  user: 'curtiscastro',
  host: 'localhost',
  database: 'superb_api',
  password: '',
  port: 5432,
});
client.connect();

// client.query('SELECT NOW()', (err, res) => {
//   console.log(err, res);
//   client.end();
// })

module.exports = client;
