const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'CHANGE_ME_POSTGRES_PASSWORD',
  host: 'localhost',
  database: 'auth_db',
  port: 5432,
});

async function check() {
  try {
    await client.connect();
    const res = await client.query('SELECT email, role FROM users;');
    console.log("Users in database:");
    console.log(res.rows);
  } catch (err) {
    console.error("Error connecting to db:", err.message);
  } finally {
    await client.end();
  }
}

check();
