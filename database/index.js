const { Client, Pool } = require('pg');

// const client = new Client({
//   user: 'curtiscastro',
//   host: 'localhost',
//   database: 'superb_api',
//   password: '',
//   port: 5432,
// });
// client.connect();

const pool = new Pool({
  user: 'curtiscastro',
  host: 'localhost',
  database: 'superb_api',
  password: '',
  port: 5432,
});
pool.connect();

// module.exports = {
//   client,
//   pool,
// };
module.exports = pool;
