// src/db/setup.js
// Run once:  node src/db/setup.js
// This reads schema.sql and executes it against your MySQL server.

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

(async () => {
  let conn;
  try {
    // Connect without selecting a database first
    conn = await mysql.createConnection({
      host:     process.env.DB_HOST     || 'localhost',
      port:     process.env.DB_PORT     || 3306,
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await conn.query(sql);

    console.log('✅  Database & tables created successfully!');
    console.log('📦  Default admin → email: admin@medicore.in  password: admin123');
  } catch (err) {
    console.error('❌  Setup failed:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
