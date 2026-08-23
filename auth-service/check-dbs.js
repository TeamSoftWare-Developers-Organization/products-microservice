const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'zafer4519932093',
  host: 'localhost',
  database: 'postgres',
  port: 5432,
});

async function check() {
  try {
    await client.connect();
    const res = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
    console.log("Databases:");
    console.log(res.rows.map(r => r.datname));
  } catch (err) {
    console.error("Error connecting to db:", err.message);
  } finally {
    await client.end();
  }
}

check();
