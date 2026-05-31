const { Client } = require('pg');

const config = {
  user: 'postgres.xcyohwsknjupekdpncqp',
  password: 'agentproperty123oke!ok!', // raw password (unencoded)
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: 5432, // Let's try direct port first
  database: 'postgres',
  ssl: { rejectUnauthorized: false } // Supabase requires SSL
};

async function run() {
  console.log("Testing pg connection to Tokyo direct port 5432...");
  const client5432 = new Client(config);
  try {
    await client5432.connect();
    console.log("SUCCESS! Connected to port 5432!");
    const res = await client5432.query('SELECT 1');
    console.log("Query result:", res.rows);
    await client5432.end();
    return;
  } catch (err) {
    console.error("Port 5432 Failed:", err.message);
    try { await client5432.end(); } catch (e) {}
  }

  console.log("\nTesting pg connection to Tokyo pooling port 6543...");
  const client6543 = new Client({ ...config, port: 6543 });
  try {
    await client6543.connect();
    console.log("SUCCESS! Connected to port 6543!");
    const res = await client6543.query('SELECT 1');
    console.log("Query result:", res.rows);
    await client6543.end();
  } catch (err) {
    console.error("Port 6543 Failed:", err.message);
    try { await client6543.end(); } catch (e) {}
  }
}

run();
