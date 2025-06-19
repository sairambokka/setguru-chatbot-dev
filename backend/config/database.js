const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // For production, always use SSL. For local, you might not need it or specify self-signed certs.
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Simple query function for direct queries
module.exports = {
  query: (text, params) => pool.query(text, params),
  // Optional: Method to get a client for transactions or more complex operations
  getClient: () => pool.connect(),
};