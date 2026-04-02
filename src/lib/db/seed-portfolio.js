#!/usr/bin/env node

// Seeds the portfolio_data table from the current portfolio.json
// Usage: node src/lib/db/seed-portfolio.js
// Requires DATABASE_URL env var

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL env var is required');
    process.exit(1);
  }

  const jsonPath = path.join(__dirname, '../../data/portfolio.json');
  const raw = fs.readFileSync(jsonPath, 'utf-8');

  // Validate it's valid JSON
  JSON.parse(raw);

  const pool = mysql.createPool({ uri: dbUrl });

  // Create table if not exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS portfolio_data (
      id         INT PRIMARY KEY DEFAULT 1,
      data       JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Upsert the data
  await pool.query(
    'INSERT INTO portfolio_data (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)',
    [raw]
  );

  console.log('Portfolio data seeded to MySQL successfully.');
  await pool.end();
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
